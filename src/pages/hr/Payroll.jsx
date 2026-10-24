import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Notice, PageHeader, Spinner, Table, money } from '../../components/ui'

export default function Payroll() {
  const { user } = useAuth()
  const isHr = user.role === 'hr'
  const { data, loading, error, reload } = useFetch(E.payroll)
  const rows = listOf(data, 'runs', 'payrolls')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const create = async () => {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.post(E.payroll, { month })
      setMsg(`Draft created for ${month}`)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Payroll" subtitle={isHr ? 'Create and review the monthly draft. Admin finalizes.' : 'Review runs and finalize'}>
        {isHr && (
          <>
            <input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
            <button className="btn" disabled={busy || !month} onClick={create}>
              {busy ? 'Creating...' : 'Create draft'}
            </button>
          </>
        )}
      </PageHeader>
      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="No payroll runs yet"
          columns={[
            { label: 'Month', key: 'month' },
            { label: 'Employees', render: (r) => r.employeeCount ?? r.count ?? '-' },
            { label: 'Total gross', render: (r) => money(r.totalGross) },
            { label: 'Total net', render: (r) => money(r.totalNet) },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              label: '',
              render: (r) => (
                <Link to={`/payroll/${r._id}`} className="text-sm text-teal-600 underline">
                  Open
                </Link>
              ),
            },
          ]}
        />
      )}
    </>
  )
}
