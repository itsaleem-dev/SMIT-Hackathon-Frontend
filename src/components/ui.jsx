import { useEffect } from 'react'

export function Spinner({ full }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'h-screen' : 'py-10'}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline">
          Retry
        </button>
      )}
    </div>
  )
}

export function Notice({ message, type = 'success' }) {
  if (!message) return null
  const cls =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-amber-200 bg-amber-50 text-amber-700'
  return <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>{message}</div>
}

export function Empty({ text = 'No data yet' }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  )
}

const badgeColors = {
  present: 'bg-emerald-100 text-emerald-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-700',
  half_day: 'bg-orange-100 text-orange-700',
  missing_checkout: 'bg-yellow-100 text-yellow-700',
  on_leave: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-200 text-slate-600',
  draft: 'bg-slate-200 text-slate-700',
  finalized: 'bg-teal-100 text-teal-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-200 text-slate-600',
  probation: 'bg-sky-100 text-sky-700',
}

export function Badge({ children }) {
  const key = String(children || '').toLowerCase()
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        badgeColors[key] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {String(children || '').replace('_', ' ')}
    </span>
  )
}

export function Table({ columns, rows, empty = 'No records found', rowKey = '_id' }) {
  if (!rows || rows.length === 0) return <Empty text={empty} />
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.label} className="th">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={r[rowKey] || i} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key || c.label} className="td">
                  {c.render ? c.render(r) : r[c.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-slate-700">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'teal' }) {
  const tones = {
    teal: 'text-teal-600',
    amber: 'text-amber-500',
    indigo: 'text-indigo-600',
    red: 'text-red-600',
    slate: 'text-slate-800',
  }
  return (
    <div className="card">
      <div className={`text-2xl font-bold ${tones[tone]}`}>{value ?? '-'}</div>
      <div className="text-xs text-slate-500">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-sm">
      <button className="btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button className="btn-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  )
}

export function AiLabel() {
  return (
    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">
      AI-generated
    </span>
  )
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-')
export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
export const money = (n) =>
  n === undefined || n === null ? '-' : Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
