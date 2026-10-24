import { useEffect, useState } from 'react'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch from '../../components/useFetch'
import { Badge, ErrorBox, Field, Notice, PageHeader, Spinner, fmtDate } from '../../components/ui'

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value || '-'}</div>
    </div>
  )
}

export default function Profile() {
  const { data, loading, error, reload } = useFetch(E.myProfile)
  const emp = data?.employee || data
  const [form, setForm] = useState({ phone: '', address: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (emp) setForm({ phone: emp.phone || '', address: emp.address || '' })
  }, [emp])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.put(E.myProfile, form)
      setMsg('Profile updated')
      reload()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title="My Profile" subtitle="You can edit your phone and address only" />
      <ErrorBox message={error} onRetry={reload} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-lg font-semibold">{emp?.name}</div>
            <Badge>{emp?.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Employee code" value={emp?.code} />
            <Info label="Email" value={emp?.email} />
            <Info label="Department" value={emp?.department?.name} />
            <Info label="Designation" value={emp?.designation?.name} />
            <Info label="Gender" value={emp?.gender} />
            <Info label="Joining date" value={fmtDate(emp?.joiningDate)} />
          </div>
        </div>
        <form onSubmit={save} className="card space-y-3">
          <ErrorBox message={err} />
          <Notice message={msg} />
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <textarea className="input" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <button className="btn" disabled={busy}>
            {busy ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </>
  )
}
