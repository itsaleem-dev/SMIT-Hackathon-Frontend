import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Field, Notice, PageHeader, Spinner, Table, fmtDate, fmtTime, money } from '../../components/ui'

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value || '-'}</div>
    </div>
  )
}

function SalaryCard({ id, canEdit, employee }) {
  const [form, setForm] = useState({ basic: '', allowances: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const basic = Number(form.basic || 0)

  useEffect(() => {
    const s = employee?.salary || {}
    setForm({
      basic: s.basic ?? employee?.basicSalary ?? '',
      allowances: s.allowances ?? '',
    })
  }, [employee])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.put(`${E.salary}/${id}/salary`, { basic, allowances: Number(form.allowances || 0) })
      setMsg('Salary structure saved')
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="mb-2 text-sm font-semibold text-slate-700">Salary structure</div>
      <ErrorBox message={err} />
      <Notice message={msg} />
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Basic">
            <input type="number" min="1" className="input" disabled={!canEdit} value={form.basic} onChange={(e) => setForm({ ...form, basic: e.target.value })} />
          </Field>
          <Field label="Extra allowances">
            <input type="number" min="0" className="input" disabled={!canEdit} value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
          <div>HRA (40%): <span className="font-medium text-slate-800">{money(basic * 0.4)}</span></div>
          <div>Medical (10%): <span className="font-medium text-slate-800">{money(basic * 0.1)}</span></div>
          <div>Gross (1.5x): <span className="font-medium text-slate-800">{money(basic * 1.5 + Number(form.allowances || 0))}</span></div>
        </div>
        {canEdit && (
          <button className="btn" disabled={busy}>
            {busy ? 'Saving...' : 'Save salary'}
          </button>
        )}
      </form>
    </div>
  )
}

export default function Employee360() {
  const { id } = useParams()
  const { user } = useAuth()
  const isHr = user.role === 'hr'
  const { data, loading, error, reload } = useFetch(`${E.employees}/${id}`)
  const emp = data?.employee || data
  const att = listOf(data, 'attendance').length ? listOf(data, 'attendance') : emp?.attendance || []
  const leaves = emp?.leaves || data?.leaves || []
  const balances = emp?.leaveBalance || data?.leaveBalance || []
  const payslips = emp?.payslips || data?.payslips || []

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title={emp?.name || 'Employee'} subtitle={`${emp?.code || ''} ${emp?.designation?.name ? '· ' + emp.designation.name : ''}`}>
        {isHr && (
          <Link to={`/employees/${id}/edit`} className="btn">
            Edit
          </Link>
        )}
        <Link to="/employees" className="btn-outline">
          Back
        </Link>
      </PageHeader>
      <ErrorBox message={error} onRetry={reload} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Profile</div>
            <Badge>{emp?.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Email" value={emp?.email} />
            <Info label="Phone" value={emp?.phone} />
            <Info label="Department" value={emp?.department?.name} />
            <Info label="Designation" value={emp?.designation?.name} />
            <Info label="Gender" value={emp?.gender} />
            <Info label="Joining date" value={fmtDate(emp?.joiningDate)} />
            <div className="col-span-2">
              <Info label="Address" value={emp?.address} />
            </div>
          </div>
        </div>
        <SalaryCard id={id} canEdit={isHr} employee={emp} />
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Leave balance</div>
          <Table
            rowKey="type"
            rows={balances}
            empty="No leave data"
            columns={[
              { label: 'Type', key: 'type' },
              { label: 'Quota', key: 'quota' },
              { label: 'Used', key: 'used' },
              { label: 'Remaining', key: 'remaining' },
            ]}
          />
        </div>
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Recent leaves</div>
          <Table
            rows={leaves}
            empty="No leave requests"
            columns={[
              { label: 'Type', render: (r) => r.type?.name || r.type },
              { label: 'From', render: (r) => fmtDate(r.startDate || r.start) },
              { label: 'To', render: (r) => fmtDate(r.endDate || r.end) },
              { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            ]}
          />
        </div>
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Recent attendance</div>
          <Table
            rows={att.slice(0, 10)}
            empty="No attendance records"
            columns={[
              { label: 'Date', render: (r) => fmtDate(r.date) },
              { label: 'In', render: (r) => fmtTime(r.checkIn) },
              { label: 'Out', render: (r) => fmtTime(r.checkOut) },
              { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            ]}
          />
        </div>
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Payslips</div>
          <Table
            rows={payslips}
            empty="No payslips yet"
            columns={[
              { label: 'Month', key: 'month' },
              { label: 'Gross', render: (r) => money(r.gross) },
              { label: 'Net', render: (r) => money(r.net) },
            ]}
          />
        </div>
      </div>
    </>
  )
}
