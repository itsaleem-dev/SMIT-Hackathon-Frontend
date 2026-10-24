import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import api, { errMsg } from '../../api/client.js'
import E from '../../api/endpoints.js'
import AuthShell from './AuthShell.jsx'
import { ErrorBox, Field, Spinner } from '../../components/ui.jsx'

export default function Setup() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ companyName: '', adminName: '', email: '', password: '' })

  useEffect(() => {
    api
      .get(E.setupStatus)
      .then(({ data }) => setDone(!!(data.isSetup ?? data.done ?? data.initialized)))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post(E.setup, form)
      navigate('/login')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  if (checking) return <Spinner full />
  if (done) return <Navigate to="/login" replace />

  return (
    <AuthShell title="First-run setup" subtitle="Create your company and the Admin account">
      <ErrorBox message={error} />
      <form onSubmit={submit} className="space-y-3">
        <Field label="Company name">
          <input className="input" required value={form.companyName} onChange={set('companyName')} />
        </Field>
        <Field label="Admin name">
          <input className="input" required value={form.adminName} onChange={set('adminName')} />
        </Field>
        <Field label="Admin email">
          <input className="input" type="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Password">
          <input className="input" type="password" minLength={6} required value={form.password} onChange={set('password')} />
        </Field>
        <button className="btn w-full" disabled={busy}>
          {busy ? 'Creating...' : 'Create company'}
        </button>
      </form>
    </AuthShell>
  )
}
