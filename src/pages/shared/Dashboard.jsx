import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import CheckInWidget from '../../components/CheckInWidget'
import { BarBox, LineBox, PieBox } from '../../components/Charts'
import {
  AiLabel,
  Empty,
  ErrorBox,
  PageHeader,
  Spinner,
  StatCard,
  Table,
  fmtDate,
  money,
} from '../../components/ui'

function Filters({ filters, setFilters }) {
  const { data } = useFetch(E.departments)
  const depts = listOf(data, 'departments')
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="label">From</label>
        <input
          type="date"
          className="input"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
      </div>
      <div>
        <label className="label">To</label>
        <input
          type="date"
          className="input"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Department</label>
        <select
          className="input"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All</option>
          {depts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-outline" onClick={() => setFilters({ from: '', to: '', department: '' })}>
        Reset
      </button>
    </div>
  )
}

function AiSummary({ filters, kpis }) {
  const [text, setText] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post(E.aiSummary, { filters, kpis })
      const bullets = data.bullets || data.summary || data.insights || []
      setText(Array.isArray(bullets) ? bullets : String(bullets).split('\n').filter(Boolean))
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          AI summary {text.length > 0 && <AiLabel />}
        </div>
        <button className="btn" onClick={run} disabled={busy}>
          {busy ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>
      <ErrorBox message={error} />
      {text.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {text.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Click Summarize for insights on the current filters.</p>
      )}
    </div>
  )
}

function Announcements() {
  const { data } = useFetch(E.announcements, { limit: 3 })
  const list = listOf(data, 'announcements').slice(0, 3)
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Announcements</div>
        <Link to="/announcements" className="text-xs text-teal-600 underline">
          View all
        </Link>
      </div>
      {list.length === 0 ? (
        <Empty text="No announcements" />
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((a) => (
            <li key={a._id}>
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">{fmtDate(a.createdAt)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function useFilters() {
  const [filters, setFilters] = useState({ from: '', to: '', department: '' })
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  return { filters, setFilters, params }
}

function HrDashboard() {
  const { filters, setFilters, params } = useFilters()
  const { data, loading, error, reload } = useFetch(E.dashboardHr, params)
  const k = data?.kpis || {}

  return (
    <>
      <PageHeader title="HR Dashboard" subtitle="People operations overview" />
      <Filters filters={filters} setFilters={setFilters} />
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Headcount" value={k.headcount} />
            <StatCard label="Present today" value={k.present} />
            <StatCard label="On leave" value={k.onLeave} tone="indigo" />
            <StatCard label="Late today" value={k.lateToday} tone="amber" />
            <StatCard label="Pending approvals" value={k.pendingApprovals} tone="red" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LineBox title="Attendance trend" data={data?.attendanceTrend} x="date" y="rate" />
            <BarBox title="Absenteeism by department" data={data?.absenteeismByDept} x="department" y="value" />
            <PieBox title="Leave by type" data={data?.leaveByType} name="type" value="days" />
            <div className="card">
              <div className="mb-2 text-sm font-semibold text-slate-700">Top 5 late-comers</div>
              <Table
                rowKey="name"
                rows={data?.topLateComers}
                columns={[
                  { label: 'Employee', key: 'name' },
                  { label: 'Late days', key: 'count' },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AiSummary filters={params} kpis={data} />
            <Announcements />
          </div>
        </div>
      )}
    </>
  )
}

function AdminDashboard() {
  const { filters, setFilters, params } = useFilters()
  const { data, loading, error, reload } = useFetch(E.dashboardAdmin, params)
  const k = data?.kpis || {}

  return (
    <>
      <PageHeader title="Company Dashboard" subtitle="Company-wide overview" />
      <Filters filters={filters} setFilters={setFilters} />
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Headcount" value={k.headcount} />
            <StatCard label="Attrition YTD (%)" value={k.attritionYtd} tone="red" />
            <StatCard label="Payroll cost" value={money(k.payrollCost)} tone="indigo" />
            <StatCard label="Average salary" value={money(k.avgSalary)} tone="amber" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <BarBox title="Headcount by department" data={data?.headcountByDept} x="department" y="count" />
            <BarBox title="Payroll cost by department" data={data?.payrollCostByDept} x="department" y="cost" />
            <PieBox title="Gender" data={data?.gender} name="name" value="value" />
            <BarBox title="Tenure" data={data?.tenure} x="bucket" y="count" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">Audit feed</div>
                <Link to="/audit" className="text-xs text-teal-600 underline">
                  Full log
                </Link>
              </div>
              <Table
                rows={data?.auditFeed}
                columns={[
                  { label: 'Action', key: 'action' },
                  { label: 'Entity', key: 'entity' },
                  { label: 'When', render: (r) => fmtDate(r.createdAt) },
                ]}
              />
            </div>
            <AiSummary filters={params} kpis={data} />
          </div>
          <Announcements />
        </div>
      )}
    </>
  )
}

function EmployeeDashboard() {
  const { data, loading, error, reload } = useFetch(E.dashboardEmployee)
  const balances = data?.leaveBalance || []
  const hours = Number(data?.hoursThisWeek || 0)
  const pct = Math.min(100, Math.round((hours / 40) * 100))

  return (
    <>
      <PageHeader title="My Dashboard" subtitle="Your attendance, leave and payslip at a glance" />
      <ErrorBox message={error} onRetry={reload} />
      <div className="grid gap-4 lg:grid-cols-3">
        <CheckInWidget onChange={reload} />
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Hours this week</div>
          <div className="text-2xl font-bold text-teal-600">{hours.toFixed(1)} / 40 h</div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Late count: <span className="font-semibold text-amber-600">{data?.lateCount ?? 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="mb-2 text-sm font-semibold text-slate-700">Last payslip</div>
          {data?.lastPayslip ? (
            <>
              <div className="text-2xl font-bold">{money(data.lastPayslip.net)}</div>
              <div className="text-xs text-slate-500">{data.lastPayslip.month}</div>
              <Link to="/payslips" className="mt-2 inline-block text-sm text-teal-600 underline">
                View payslips
              </Link>
            </>
          ) : (
            <Empty text="No payslip yet" />
          )}
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card">
            <div className="mb-2 text-sm font-semibold text-slate-700">Leave balance</div>
            {balances.length === 0 ? (
              <Empty text="No leave types configured" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {balances.map((b) => (
                  <StatCard key={b.type} label={b.type} value={b.remaining ?? b.balance} tone="indigo" />
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Link to="/leaves/apply" className="btn">
                Apply leave
              </Link>
              <Link to="/ai" className="btn-outline">
                Ask my assistant
              </Link>
            </div>
          </div>
          <Announcements />
        </div>
      )}
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  if (user.role === 'admin') return <AdminDashboard />
  if (user.role === 'hr') return <HrDashboard />
  return <EmployeeDashboard />
}
