import { useState } from 'react'
import { useNavigate } from 'react-router'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import AuthShell from './AuthShell'
import { ErrorBox, Field } from '../../components/ui'

export default function ChangePassword() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('Passwords do not match')
    setBusy(true)
    setError('')
    try {
      await api.post(E.changePassword, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      await refresh()
      navigate('/dashboard')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Change password"
      subtitle={user?.mustChangePassword ? 'You must change your temporary password to continue' : undefined}
    >
      <ErrorBox message={error} />
      <form onSubmit={submit} className="space-y-3">
        <Field label="Current / temporary password">
          <input
            className="input"
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </Field>
        <Field label="New password">
          <input
            className="input"
            type="password"
            minLength={6}
            required
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            className="input"
            type="password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        <button className="btn w-full" disabled={busy}>
          {busy ? 'Saving...' : 'Update password'}
        </button>
        {!user?.mustChangePassword && (
          <button type="button" className="btn-outline w-full" onClick={() => navigate(-1)}>
            Cancel
          </button>
        )}
      </form>
    </AuthShell>
  )
}
