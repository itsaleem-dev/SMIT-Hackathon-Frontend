import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import CheckInWidget from '../../components/CheckInWidget'
import {
  Badge,
  ErrorBox,
  Field,
  Modal,
  Notice,
  PageHeader,
  Spinner,
  Table,
  fmtDate,
  fmtTime,
} from '../../components/ui'

const today = () => new Date().toISOString().slice(0, 10)
const monthStart = () => today().slice(0, 8) + '01'

function EmployeeAttendance() {
  const [range, setRange] = useState({ from: monthStart(), to: today() })
  const { data, loading, error, reload } = useFetch(E.attendanceMy, range)
  const rows = listOf(data, 'records')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ checkIn: '', checkOut: '', reason: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const open = (r) => {
    setForm({ checkIn: '', checkOut: '', reason: '' })
    setErr('')
    setModal(r)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api.post(E.corrections, { date: modal.date, attendanceId: modal._id, ...form })
      setMsg('Correction request sent to HR')
      setModal(null)
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="My Attendance" subtitle="Check in, view your calendar and request corrections" />
      <Notice message={msg} />
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <CheckInWidget onChange={reload} />
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Field label="From">
          <input type="date" className="input" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        </Field>
        <Field label="To">
          <input type="date" className="input" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </Field>
      </div>
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="No attendance records in this range"
          columns={[
            { label: 'Date', render: (r) => fmtDate(r.date) },
            { label: 'Check-in', render: (r) => fmtTime(r.checkIn) },
            { label: 'Check-out', render: (r) => fmtTime(r.checkOut) },
            { label: 'Hours', render: (r) => (r.hours != null ? Number(r.hours).toFixed(1) : '-') },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              label: '',
              render: (r) => (
                <button className="text-sm text-teal-600 underline" onClick={() => open(r)}>
                  Request correction
                </button>
              ),
            },
          ]}
        />
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={`Correction for ${modal ? fmtDate(modal.date) : ''}`}>
        <ErrorBox message={err} />
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Correct check-in">
              <input type="time" className="input" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </Field>
            <Field label="Correct check-out">
              <input type="time" className="input" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </Field>
          </div>
          <Field label="Reason">
            <textarea className="input" rows={3} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>
          <button className="btn w-full" disabled={busy}>
            {busy ? 'Sending...' : 'Send request'}
          </button>
        </form>
      </Modal>
    </>
  )
}

function Board() {
  const [filters, setFilters] = useState({ date: today(), department: '', status: '' })
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  const { data, loading, error, reload } = useFetch(E.attendanceBoard, params)
  const { data: dd } = useFetch(E.departments)
  const depts = listOf(dd, 'departments')
  const rows = listOf(data, 'records', 'board')

  return (
    <>
      <PageHeader title="Daily Attendance Board" subtitle="Everyone's attendance for the selected day" />
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Field label="Date">
          <input type="date" className="input" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        </Field>
        <Field label="Department">
          <select className="input" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
            <option value="">All</option>
            {depts.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            {['present', 'late', 'half_day', 'absent', 'on_leave', 'missing_checkout'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="No attendance records for this day"
          columns={[
            { label: 'Code', render: (r) => r.employee?.code || r.code || '-' },
            { label: 'Employee', render: (r) => r.employee?.name || r.name || '-' },
            { label: 'Department', render: (r) => r.employee?.department?.name || r.department || '-' },
            { label: 'Check-in', render: (r) => fmtTime(r.checkIn) },
            { label: 'Check-out', render: (r) => fmtTime(r.checkOut) },
            { label: 'Source', key: 'source' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
      )}
    </>
  )
}

export default function Attendance() {
  const { user } = useAuth()
  return user.role === 'employee' ? <EmployeeAttendance /> : <Board />
}
