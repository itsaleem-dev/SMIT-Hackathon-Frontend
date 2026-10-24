import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="text-5xl font-bold text-slate-300">404</div>
      <p className="text-slate-500">Page not found</p>
      <Link to="/dashboard" className="btn">
        Go to dashboard
      </Link>
    </div>
  )
}
