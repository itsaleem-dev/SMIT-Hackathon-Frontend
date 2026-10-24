import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Notice, PageHeader, Spinner, Table, fmtDate, fmtTime } from '../../components/ui'

export default function Corrections() {
  const { user } = useAuth()
  const isHr = user.role === 'hr'
  const [status, setStatus] = useState('pending')
  const { data, loading, error, reload } = useFetch(E.corrections, { status })
  const rows = listOf(data, 'corrections')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const decide = async (r, decision) => {
    setErr('')
    setMsg('')
    try {
      await api.patch(`${E.corrections}/${r._id}/${decision}`)
      setMsg(`Correction ${decision === 'approve' ? 'approved' : 'rejected'}`)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  return (
    <>
      <PageHeader title="Attendance Corrections" subtitle={isHr ? 'Approve or reject employee requests' : 'View only'}>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </PageHeader>
      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="No correction requests"
          columns={[
            { label: 'Employee', render: (r) => r.employee?.name || '-' },
            { label: 'Date', render: (r) => fmtDate(r.date) },
            { label: 'Requested in', render: (r) => r.checkIn || fmtTime(r.checkIn) },
            { label: 'Requested out', render: (r) => r.checkOut || fmtTime(r.checkOut) },
            { label: 'Reason', key: 'reason' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              label: '',
              render: (r) =>
                isHr && r.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => decide(r, 'approve')}>
                      Approve
                    </button>
                    <button className="btn-danger" onClick={() => decide(r, 'reject')}>
                      Reject
                    </button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}
    </>
  )
}
