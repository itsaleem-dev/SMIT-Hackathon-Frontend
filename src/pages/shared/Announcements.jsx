import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Empty, ErrorBox, Field, Notice, PageHeader, Spinner, fmtDate } from '../../components/ui'

export default function Announcements() {
  const { user } = useAuth()
  const canPost = user.role === 'admin' || user.role === 'hr'
  const { data, loading, error, reload } = useFetch(E.announcements)
  const list = listOf(data, 'announcements')
  const [form, setForm] = useState({ title: '', body: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.post(E.announcements, form)
      setForm({ title: '', body: '' })
      setMsg('Announcement posted')
      reload()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Announcements" subtitle="Company-wide updates" />
      {canPost && (
        <form onSubmit={submit} className="card mb-4 space-y-3">
          <ErrorBox message={err} />
          <Notice message={msg} />
          <Field label="Title">
            <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Message">
            <textarea className="input" rows={3} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
          <button className="btn" disabled={busy}>
            {busy ? 'Posting...' : 'Post announcement'}
          </button>
        </form>
      )}
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty text="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a._id} className="card">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-slate-500">{fmtDate(a.createdAt)}</div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{a.body}</p>
              {a.postedBy?.name && <div className="mt-2 text-xs text-slate-400">By {a.postedBy.name}</div>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
