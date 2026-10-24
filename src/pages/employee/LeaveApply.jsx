import { useState } from 'react'
import { useNavigate } from 'react-router'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { AiLabel, ErrorBox, Field, Notice, PageHeader, StatCard } from '../../components/ui'

const empty = { type: '', start: '', end: '', reason: '' }

export default function LeaveApply() {
  const navigate = useNavigate()
  const { data: td } = useFetch(E.leaveTypes)
  const { data: bd } = useFetch(E.leavesBalance)
  const types = listOf(td, 'leaveTypes')
  const balances = listOf(bd, 'balances')
  const [form, setForm] = useState(empty)
  const [text, setText] = useState('')
  const [smartBusy, setSmartBusy] = useState(false)
  const [smartMsg, setSmartMsg] = useState('')
  const [smartErr, setSmartErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const smart = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSmartBusy(true)
    setSmartErr('')
    setSmartMsg('')
    try {
      const { data } = await api.post(E.aiSmartLeave, { text }, { timeout: 20000 })
      const l = data.leave || data
      const match = types.find((t) => t._id === l.type || t.name?.toLowerCase() === String(l.type).toLowerCase())
      setForm({
        type: match?._id || '',
        start: l.start || '',
        end: l.end || l.start || '',
        reason: l.reason || '',
      })
      setSmartMsg('Form pre-filled by AI. Please review and confirm before submitting.')
    } catch (e2) {
      setSmartErr(
        e2.response?.status === 429
          ? 'AI limit reached for this hour. Please fill the form manually.'
          : 'AI could not read that request. Please fill the form manually.'
      )
    } finally {
      setSmartBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api.post(E.leaves, form)
      navigate('/leaves')
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Apply for Leave" subtitle="Working days only. Weekends and holidays are skipped." />

      {balances.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {balances.map((b) => (
            <StatCard key={b.type} label={`${b.type} left`} value={b.remaining ?? b.balance} tone="indigo" />
          ))}
        </div>
      )}

      <form onSubmit={smart} className="card mb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Smart leave <AiLabel />
        </div>
        <ErrorBox message={smartErr} />
        <Notice message={smartMsg} type="warn" />
        <textarea
          className="input"
          rows={2}
          placeholder="e.g. I need next Monday and Tuesday off for my sister's wedding"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" disabled={smartBusy || !text.trim()}>
          {smartBusy ? 'Reading...' : 'Fill form with AI'}
        </button>
      </form>

      <form onSubmit={submit} className="card max-w-2xl space-y-3">
        <ErrorBox message={err} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Leave type">
            <select className="input" required value={form.type} onChange={set('type')}>
              <option value="">Select</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" className="input" required value={form.start} onChange={set('start')} />
          </Field>
          <Field label="End date">
            <input type="date" className="input" required min={form.start} value={form.end} onChange={set('end')} />
          </Field>
        </div>
        <Field label="Reason">
          <textarea className="input" rows={3} required value={form.reason} onChange={set('reason')} />
        </Field>
        <div className="flex gap-2">
          <button className="btn" disabled={busy}>
            {busy ? 'Submitting...' : 'Submit request'}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate('/leaves')}>
            My leaves
          </button>
        </div>
      </form>
    </>
  )
}
