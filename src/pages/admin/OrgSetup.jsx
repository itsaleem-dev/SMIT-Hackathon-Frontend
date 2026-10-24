import { useState } from 'react'
import { NavLink, Navigate, useParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { ErrorBox, Field, Modal, Notice, PageHeader, Spinner, Table, fmtDate } from '../../components/ui'

const TABS = {
  departments: {
    label: 'Departments',
    url: E.departments,
    fields: [{ key: 'name', label: 'Name', required: true }],
    columns: [{ label: 'Name', key: 'name' }],
  },
  designations: {
    label: 'Designations',
    url: E.designations,
    fields: [{ key: 'name', label: 'Title', required: true }],
    columns: [{ label: 'Title', key: 'name' }],
  },
  'leave-types': {
    label: 'Leave types',
    url: E.leaveTypes,
    fields: [
      { key: 'name', label: 'Name (e.g. annual, sick, casual, unpaid)', required: true },
      { key: 'yearlyQuota', label: 'Yearly quota (days)', type: 'number', required: true },
      { key: 'paid', label: 'Paid leave', type: 'checkbox' },
    ],
    columns: [
      { label: 'Name', key: 'name' },
      { label: 'Yearly quota', key: 'yearlyQuota' },
      { label: 'Paid', render: (r) => (r.paid === false ? 'No' : 'Yes') },
    ],
  },
  holidays: {
    label: 'Holidays',
    url: E.holidays,
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
    ],
    columns: [
      { label: 'Name', key: 'name' },
      { label: 'Date', render: (r) => fmtDate(r.date) },
    ],
  },
}

function Panel({ tab, canEdit }) {
  const cfg = TABS[tab]
  const { data, loading, error, reload } = useFetch(cfg.url)
  const rows = listOf(data)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const openNew = () => {
    setForm(tab === 'leave-types' ? { paid: true } : {})
    setErr('')
    setModal({})
  }
  const openEdit = (r) => {
    setForm({ ...r, date: r.date ? String(r.date).slice(0, 10) : r.date })
    setErr('')
    setModal(r)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const body = { ...form }
    cfg.fields.forEach((f) => {
      if (f.type === 'number') body[f.key] = Number(body[f.key])
    })
    try {
      if (modal._id) await api.put(`${cfg.url}/${modal._id}`, body)
      else await api.post(cfg.url, body)
      setModal(null)
      setMsg('Saved')
      reload()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return
    try {
      await api.delete(`${cfg.url}/${r._id}`)
      setMsg('Deleted')
      reload()
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  const columns = [
    ...cfg.columns,
    ...(canEdit
      ? [
          {
            label: '',
            render: (r) => (
              <div className="flex gap-3 text-sm">
                <button className="text-teal-600 underline" onClick={() => openEdit(r)}>
                  Edit
                </button>
                <button className="text-red-600 underline" onClick={() => remove(r)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="mb-3 flex justify-end">
        {canEdit && (
          <button className="btn" onClick={openNew}>
            Add {cfg.label.toLowerCase().replace(/s$/, '')}
          </button>
        )}
      </div>
      <Notice message={msg} />
      <ErrorBox message={error || (!modal ? err : '')} onRetry={reload} />
      {loading ? <Spinner /> : <Table rows={rows} columns={columns} empty={`No ${cfg.label.toLowerCase()} yet`} />}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?._id ? `Edit ${cfg.label}` : `Add ${cfg.label}`}>
        <ErrorBox message={err} />
        <form onSubmit={submit} className="space-y-3">
          {cfg.fields.map((f) =>
            f.type === 'checkbox' ? (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                {f.label}
              </label>
            ) : (
              <Field key={f.key} label={f.label}>
                <input
                  className="input"
                  type={f.type || 'text'}
                  min={f.type === 'number' ? 0 : undefined}
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </Field>
            )
          )}
          <button className="btn w-full" disabled={busy}>
            {busy ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </>
  )
}

export default function OrgSetup() {
  const { tab } = useParams()
  const { user } = useAuth()
  if (!TABS[tab]) return <Navigate to="/org/departments" replace />

  return (
    <>
      <PageHeader
        title="Organization Setup"
        subtitle={user.role === 'admin' ? 'Departments, designations, leave types and holidays' : 'View only'}
      />
      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {Object.entries(TABS).map(([k, v]) => (
          <NavLink
            key={k}
            to={`/org/${k}`}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            {v.label}
          </NavLink>
        ))}
      </div>
      <Panel key={tab} tab={tab} canEdit={user.role === 'admin'} />
    </>
  )
}
