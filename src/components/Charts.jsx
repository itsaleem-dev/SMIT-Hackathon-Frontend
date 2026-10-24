import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Empty } from './ui'

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9', '#84cc16', '#ec4899']

function Box({ title, children, hasData }) {
  return (
    <div className="card">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      {hasData ? <div className="h-60">{children}</div> : <Empty text="No data for these filters" />}
    </div>
  )
}

export function BarBox({ title, data, x, y }) {
  const has = Array.isArray(data) && data.length > 0
  return (
    <Box title={title} hasData={has}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={x} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey={y} radius={[4, 4, 0, 0]}>
            {(data || []).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export function LineBox({ title, data, x, y }) {
  const has = Array.isArray(data) && data.length > 0
  return (
    <Box title={title} hasData={has}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={x} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey={y} stroke="#f59e0b" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

export function PieBox({ title, data, name, value }) {
  const has = Array.isArray(data) && data.length > 0
  return (
    <Box title={title} hasData={has}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={value} nameKey={name} outerRadius={80} label>
            {(data || []).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
