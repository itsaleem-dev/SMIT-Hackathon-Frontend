import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Notice, PageHeader, Spinner, StatCard, Table, money } from '../../components/ui'

export default function PayrollDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch(`${E.payroll}/${id}`)
  const run = data?.run || data
  const lines = run?.payslips || run?.lines || listOf(data, 'payslips', 'lines')
  const locked = run?.status === 'finalized'
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const act = async (path, text) => {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.post(`${E.payroll}/${id}/${path}`)
      setMsg(text)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const finalize = () => {
    if (window.confirm('Finalize this payroll? It will be locked and cannot be edited.')) {
      act('finalize', 'Payroll finalized and locked')
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title={`Payroll ${run?.month || ''}`} subtitle={locked ? 'Finalized and locked' : 'Draft'}>
        <Badge>{run?.status}</Badge>
        {user.role === 'hr' && !locked && (
          <button className="btn-outline" disabled={busy} onClick={() => act('recalculate', 'Draft recalculated')}>
            Recalculate
          </button>
        )}
        {user.role === 'admin' && !locked && (
          <button className="btn" disabled={busy} onClick={finalize}>
            Finalize payroll
          </button>
        )}
        <Link to="/payroll" className="btn-outline">
          Back
        </Link>
      </PageHeader>
      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Employees" value={lines.length} />
        <StatCard label="Total gross" value={money(run?.totalGross)} tone="indigo" />
        <StatCard label="Total tax" value={money(run?.totalTax)} tone="amber" />
        <StatCard label="Total net" value={money(run?.totalNet)} />
      </div>
      <Table
        rows={lines}
        empty="No payslip lines in this run"
        columns={[
          { label: 'Employee', render: (r) => r.employee?.name || r.name || '-' },
          { label: 'Gross', render: (r) => money(r.gross) },
          { label: 'Absent', key: 'absentDays' },
          { label: 'Unpaid', key: 'unpaidDays' },
          { label: 'Half days', key: 'halfDays' },
          { label: 'Deductions', render: (r) => money(r.deductions) },
          { label: 'Tax', render: (r) => money(r.tax) },
          { label: 'Net', render: (r) => <span className="font-semibold">{money(r.net)}</span> },
        ]}
      />
    </>
  )
}
