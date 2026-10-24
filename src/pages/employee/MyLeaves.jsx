import { useState } from 'react'
import { Link } from 'react-router'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Notice, PageHeader, Spinner, StatCard, Table, fmtDate } from '../../components/ui'

export default function MyLeaves() {
  const { data, loading, error, reload } = useFetch(E.leavesMy)
  const { data: bd, reload: reloadBal } = useFetch(E.leavesBalance)
  const rows = listOf(data, 'leaves')
  const balances = listOf(bd, 'balances')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const cancel = async (r) => {
    if (!window.confirm('Cancel this leave request?')) return
    setErr('')
    setMsg('')
    try {
      await api.patch(`${E.leaves}/${r._id}/cancel`)
      setMsg('Leave cancelled')
      reload()
      reloadBal()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  return (
    <>
      <PageHeader title="My Leaves" subtitle="Balance and history">
        <Link to="/leaves/apply" className="btn">
          Apply leave
        </Link>
      </PageHeader>
      {balances.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {balances.map((b) => (
            <StatCard
              key={b.type}
              label={`${b.type} (used ${b.used ?? 0} of ${b.quota ?? '-'})`}
              value={b.remaining ?? b.balance}
              tone="indigo"
            />
          ))}
        </div>
      )}
      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="You have not applied for any leave yet"
          columns={[
            { label: 'Type', render: (r) => r.type?.name || r.type },
            { label: 'From', render: (r) => fmtDate(r.startDate || r.start) },
            { label: 'To', render: (r) => fmtDate(r.endDate || r.end) },
            { label: 'Days', key: 'days' },
            { label: 'Reason', key: 'reason' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            { label: 'HR comment', key: 'comment' },
            {
              label: '',
              render: (r) =>
                ['pending', 'approved'].includes(r.status) ? (
                  <button className="text-sm text-red-600 underline" onClick={() => cancel(r)}>
                    Cancel
                  </button>
                ) : null,
            },
          ]}
        />
      )}
    </>
  )
}
