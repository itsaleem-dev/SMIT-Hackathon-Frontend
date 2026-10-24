import { useState } from 'react'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Field, Modal, Notice, PageHeader, Spinner, Table } from '../../components/ui'

export default function Users() {
  const [role, setRole] = useState('')
  const { data, loading, error, reload } = useFetch(E.users, role ? { role } : {})
  const rows = listOf(data, 'users')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api.post(E.users, { ...form, role: 'hr' })
      setModal(false)
      setForm({ name: '', email: '', password: '' })
      setMsg('HR login created. They must change the password on first sign-in.')
      reload()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (u) => {
    setErr('')
    try {
      await api.patch(`${E.users}/${u._id}/${u.active === false ? 'activate' : 'deactivate'}`)
      reload()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  const reset = async (u) => {
    const password = window.prompt(`New temporary password for ${u.email}`)
    if (!password) return
    setErr('')
    try {
      await api.patch(`${E.users}/${u._id}/reset-password`, { password })
      setMsg('Password reset. User must change it on next sign-in.')
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  return (
    <>
      <PageHeader title="Logins" subtitle="Create HR logins, deactivate or reset any login">
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="hr">HR</option>
          <option value="employee">Employee</option>
        </select>
        <button className="btn" onClick={() => setModal(true)}>
          Create HR login
        </button>
      </PageHeader>
      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          rows={rows}
          columns={[
            { label: 'Name', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Role', render: (r) => <span className="uppercase">{r.role}</span> },
            { label: 'Status', render: (r) => <Badge>{r.active === false ? 'inactive' : 'active'}</Badge> },
            {
              label: '',
              render: (r) =>
                r.role === 'admin' ? null : (
                  <div className="flex gap-3 text-sm">
                    <button className="text-teal-600 underline" onClick={() => reset(r)}>
                      Reset password
                    </button>
                    <button className="text-red-600 underline" onClick={() => toggle(r)}>
                      {r.active === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                ),
            },
          ]}
        />
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Create HR login">
        <ErrorBox message={err} />
        <form onSubmit={create} className="space-y-3">
          <Field label="Name">
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Temporary password">
            <input className="input" type="text" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <button className="btn w-full" disabled={busy}>
            {busy ? 'Creating...' : 'Create'}
          </button>
        </form>
      </Modal>
    </>
  )
}
