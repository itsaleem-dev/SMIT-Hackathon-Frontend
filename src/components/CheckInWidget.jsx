import { useState } from 'react'
import api, { errMsg } from '../api/client'
import E from '../api/endpoints'
import useFetch from './useFetch'
import { Badge, ErrorBox, Notice, fmtTime } from './ui'

export default function CheckInWidget({ onChange }) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, reload } = useFetch(E.attendanceMy, { from: today, to: today })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const list = Array.isArray(data) ? data : data?.records || data?.data || []
  const rec = list[0]
  const checkedIn = !!rec?.checkIn
  const checkedOut = !!rec?.checkOut

  const act = async (url, msg) => {
    setBusy(true)
    setError('')
    setOk('')
    try {
      await api.post(url, {})
      setOk(msg)
      await reload()
      onChange?.()
    } catch (e) {
      setError(e.response?.status === 409 ? 'Already checked in today' : errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Today</div>
        {rec?.status && <Badge>{rec.status}</Badge>}
      </div>
      <ErrorBox message={error} />
      <Notice message={ok} />
      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-slate-500">Check-in</div>
          <div className="font-medium">{fmtTime(rec?.checkIn)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Check-out</div>
          <div className="font-medium">{fmtTime(rec?.checkOut)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="btn flex-1"
          disabled={busy || checkedIn}
          onClick={() => act(E.attendanceCheckIn, 'Checked in')}
        >
          Check in
        </button>
        <button
          className="btn-outline flex-1"
          disabled={busy || !checkedIn || checkedOut}
          onClick={() => act(E.attendanceCheckOut, 'Checked out')}
        >
          Check out
        </button>
      </div>
    </div>
  )
}
