import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Empty, ErrorBox, PageHeader, Spinner, fmtDate, fmtTime } from '../../components/ui'
import { useState } from 'react'

export default function Notifications() {
  const { data, loading, error, reload } = useFetch(E.notifications)
  const list = listOf(data, 'notifications')
  const [err, setErr] = useState('')

  const markRead = async (id) => {
    try {
      await api.patch(`${E.notifications}/${id}/read`)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  const markAll = async () => {
    try {
      await api.patch(`${E.notifications}/read-all`)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  return (
    <>
      <PageHeader title="Notifications" subtitle="Leave decisions, payslips and more">
        <button className="btn-outline" onClick={markAll}>
          Mark all read
        </button>
      </PageHeader>
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty text="No notifications" />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start justify-between gap-3 ${n.read ? 'opacity-70' : 'border-teal-300'}`}
            >
              <div>
                <div className="text-sm font-medium">{n.title || n.message}</div>
                {n.title && <div className="text-sm text-slate-600">{n.message}</div>}
                <div className="mt-1 text-xs text-slate-400">
                  {fmtDate(n.createdAt)} {fmtTime(n.createdAt)}
                </div>
              </div>
              {!n.read && (
                <button className="text-xs text-teal-600 underline" onClick={() => markRead(n._id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
