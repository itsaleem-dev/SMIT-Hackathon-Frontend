import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Field, Modal, Notice, PageHeader, Spinner, Table, fmtDate } from '../../components/ui'

export default function LeaveApprovals() {
  const { user } = useAuth()
  const isHr = user.role === 'hr'
  const [status, setStatus] = useState('pending')
  const { data, loading, error, reload } = useFetch(E.leaves, { status })
  const rows = listOf(data, 'leaves')
  const [modal, setModal] = useState(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const open = (r, decision) => {
    setComment('')
    setErr('')
    setModal({ r, decision })
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api.patch(`${E.leaves}/${modal.r._id}/${modal.decision}`, { comment })
      setMsg(`Leave ${modal.decision === 'approve' ? 'approved' : 'rejected'}`)
      setModal(null)
      reload()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Leave Requests" subtitle={isHr ? 'Approve or reject with a comment' : 'View only'}>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </PageHeader>
      <Notice message={msg} />
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          empty="No leave requests"
          columns={[
            { label: 'Employee', render: (r) => r.employee?.name || '-' },
            { label: 'Type', render: (r) => r.type?.name || r.type },
            { label: 'From', render: (r) => fmtDate(r.startDate || r.start) },
            { label: 'To', render: (r) => fmtDate(r.endDate || r.end) },
            { label: 'Days', key: 'days' },
            { label: 'Reason', key: 'reason' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            { label: 'Comment', key: 'comment' },
            {
              label: '',
              render: (r) =>
                isHr && r.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => open(r, 'approve')}>
                      Approve
                    </button>
                    <button className="btn-danger" onClick={() => open(r, 'reject')}>
                      Reject
                    </button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.decision === 'approve' ? 'Approve leave' : 'Reject leave'}>
        <ErrorBox message={err} />
        <form onSubmit={submit} className="space-y-3">
          <Field label="Comment">
            <textarea className="input" rows={3} required value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          <button className={modal?.decision === 'approve' ? 'btn w-full' : 'btn-danger w-full'} disabled={busy}>
            {busy ? 'Saving...' : 'Confirm'}
          </button>
        </form>
      </Modal>
    </>
  )
}
