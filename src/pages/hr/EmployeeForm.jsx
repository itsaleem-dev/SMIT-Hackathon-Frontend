import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { ErrorBox, Field, Notice, PageHeader, Spinner } from '../../components/ui'

const empty = {
  code: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  gender: 'male',
  department: '',
  designation: '',
  joiningDate: '',
  status: 'active',
  basicSalary: '',
  tempPassword: '',
}

export default function EmployeeForm() {
  const { id } = useParams()
  const edit = !!id
  const navigate = useNavigate()
  const { data: dd } = useFetch(E.departments)
  const { data: gd } = useFetch(E.designations)
  const { data: emp, loading } = useFetch(`${E.employees}/${id}`, {}, { skip: !edit })
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [created, setCreated] = useState(null)

  useEffect(() => {
    if (!emp) return
    const e = emp.employee || emp
    setForm({
      ...empty,
      ...e,
      department: e.department?._id || e.department || '',
      designation: e.designation?._id || e.designation || '',
      joiningDate: e.joiningDate ? String(e.joiningDate).slice(0, 10) : '',
      basicSalary: e.basicSalary ?? e.salary?.basic ?? '',
    })
  }, [emp])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const body = { ...form, basicSalary: Number(form.basicSalary) }
    if (!body.tempPassword) delete body.tempPassword
    try {
      if (edit) {
        await api.put(`${E.employees}/${id}`, body)
        navigate(`/employees/${id}`)
      } else {
        const { data } = await api.post(E.employees, body)
        setCreated({ email: form.email, password: data.tempPassword || form.tempPassword })
        setForm(empty)
      }
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }

  if (edit && loading) return <Spinner />

  return (
    <>
      <PageHeader
        title={edit ? 'Edit employee' : 'Register employee'}
        subtitle={edit ? undefined : 'This also creates the employee login with a temporary password'}
      />
      <ErrorBox message={err} />
      {created && (
        <Notice
          message={`Employee created. Login: ${created.email}${created.password ? ` / temporary password: ${created.password}` : ''}. They must change it on first sign-in.`}
        />
      )}
      <form onSubmit={submit} className="card max-w-3xl space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Employee code">
            <input className="input" required value={form.code} onChange={set('code')} />
          </Field>
          <Field label="Full name">
            <input className="input" required value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Gender">
            <select className="input" value={form.gender} onChange={set('gender')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Joining date">
            <input className="input" type="date" required value={form.joiningDate} onChange={set('joiningDate')} />
          </Field>
          <Field label="Department">
            <select className="input" required value={form.department} onChange={set('department')}>
              <option value="">Select</option>
              {listOf(dd, 'departments').map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Designation">
            <select className="input" required value={form.designation} onChange={set('designation')}>
              <option value="">Select</option>
              {listOf(gd, 'designations').map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Basic salary">
            <input className="input" type="number" min="1" required value={form.basicSalary} onChange={set('basicSalary')} />
          </Field>
          {!edit && (
            <Field label="Temporary password (optional)">
              <input className="input" value={form.tempPassword} onChange={set('tempPassword')} />
            </Field>
          )}
        </div>
        <Field label="Address">
          <textarea className="input" rows={2} value={form.address} onChange={set('address')} />
        </Field>
        <div className="flex gap-2">
          <button className="btn" disabled={busy}>
            {busy ? 'Saving...' : edit ? 'Save changes' : 'Register'}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate('/employees')}>
            Back to list
          </button>
        </div>
      </form>
    </>
  )
}
