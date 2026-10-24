import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch from '../../components/useFetch'
import { ErrorBox, Field, Notice, PageHeader, Spinner } from '../../components/ui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const empty = {
  companyName: '',
  officeStart: '09:00',
  graceMinutes: 15,
  halfDayHours: 5,
  weekend: [0, 6],
  officeLat: '',
  officeLng: '',
  radiusMeters: 150,
}

export default function CompanySettings() {
  const { user } = useAuth()
  const readOnly = user.role !== 'admin'
  const { data, loading, error, reload } = useFetch(E.settings)
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (data) setForm({ ...empty, ...(data.settings || data) })
  }, [data])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggleDay = (d) =>
    setForm({
      ...form,
      weekend: form.weekend.includes(d) ? form.weekend.filter((x) => x !== d) : [...form.weekend, d],
    })

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, officeLat: p.coords.latitude, officeLng: p.coords.longitude })),
      () => setErr('Could not read your location')
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await api.put(E.settings, {
        ...form,
        graceMinutes: Number(form.graceMinutes),
        halfDayHours: Number(form.halfDayHours),
        radiusMeters: Number(form.radiusMeters),
        officeLat: form.officeLat === '' ? undefined : Number(form.officeLat),
        officeLng: form.officeLng === '' ? undefined : Number(form.officeLng),
      })
      setMsg('Settings saved. New rules apply to new records only.')
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
      <PageHeader
        title="Company Settings"
        subtitle={readOnly ? 'View only' : 'Office hours, grace time, weekend and office location'}
      />
      <ErrorBox message={error || err} onRetry={reload} />
      <Notice message={msg} />
      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <fieldset disabled={readOnly} className="space-y-4">
          <Field label="Company name">
            <input className="input" value={form.companyName} onChange={set('companyName')} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Office start">
              <input type="time" className="input" value={form.officeStart} onChange={set('officeStart')} />
            </Field>
            <Field label="Grace (minutes)">
              <input type="number" min="0" className="input" value={form.graceMinutes} onChange={set('graceMinutes')} />
            </Field>
            <Field label="Half day under (hours)">
              <input type="number" min="0" step="0.5" className="input" value={form.halfDayHours} onChange={set('halfDayHours')} />
            </Field>
          </div>
          <Field label="Weekend days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-lg border px-3 py-1 text-sm ${
                    form.weekend.includes(i) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300'
                  }`}
                >
                  <input type="checkbox" className="hidden" checked={form.weekend.includes(i)} onChange={() => toggleDay(i)} />
                  {d}
                </label>
              ))}
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Office latitude">
              <input type="number" step="any" className="input" value={form.officeLat} onChange={set('officeLat')} />
            </Field>
            <Field label="Office longitude">
              <input type="number" step="any" className="input" value={form.officeLng} onChange={set('officeLng')} />
            </Field>
            <Field label="Radius (meters)">
              <input type="number" min="0" className="input" value={form.radiusMeters} onChange={set('radiusMeters')} />
            </Field>
          </div>
          {!readOnly && (
            <button type="button" className="btn-outline" onClick={locate}>
              Use my current location
            </button>
          )}
        </fieldset>
        {!readOnly && (
          <button className="btn" disabled={busy}>
            {busy ? 'Saving...' : 'Save settings'}
          </button>
        )}
      </form>
    </>
  )
}
