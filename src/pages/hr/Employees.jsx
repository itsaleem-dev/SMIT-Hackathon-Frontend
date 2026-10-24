import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { Badge, ErrorBox, Modal, Notice, PageHeader, Pagination, Spinner, Table, fmtDate } from '../../components/ui'

export default function Employees() {
  const { user } = useAuth()
  const isHr = user.role === 'hr'
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ search: '', department: '', status: '' })
  const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
  const { data, loading, error, reload } = useFetch(E.employees, params)
  const { data: dd } = useFetch(E.departments)
  const depts = listOf(dd, 'departments')
  const rows = listOf(data, 'employees')
  const fileRef = useRef(null)
  const [importResult, setImportResult] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const setF = (k) => (e) => {
    setPage(1)
    setFilters({ ...filters, [k]: e.target.value })
  }

  const exportCsv = async () => {
    setErr('')
    try {
      const res = await api.get(E.employeesExport, { responseType: 'blob' })
      const href = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = href
      a.download = 'employees.csv'
      a.click()
      URL.revokeObjectURL(href)
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  const runImport = async (file, dryRun) => {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data: res } = await api.post(`${E.employeesImport}?dryRun=${dryRun}`, fd)
      setImportResult({ ...res, dryRun })
      if (!dryRun) {
        setMsg(`Imported ${res.imported ?? res.created ?? 0} employees`)
        setPendingFile(null)
        reload()
      }
    } catch (e) {
      if (e.response?.data?.errors) setImportResult({ errors: e.response.data.errors, dryRun })
      else setErr(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const onPick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPendingFile(f)
    runImport(f, true)
  }

  const errors = importResult?.errors || []

  return (
    <>
      <PageHeader title="Employees" subtitle="Directory, search and Employee 360">
        {isHr && (
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onPick} />
            <button className="btn-outline" onClick={() => fileRef.current?.click()}>
              Import CSV
            </button>
            <button className="btn-outline" onClick={exportCsv}>
              Export CSV
            </button>
            <Link to="/employees/new" className="btn">
              Register employee
            </Link>
          </>
        )}
      </PageHeader>

      <div className="mb-3 flex flex-wrap gap-3">
        <input className="input w-60" placeholder="Search name, code or email" value={filters.search} onChange={setF('search')} />
        <select className="input w-auto" value={filters.department} onChange={setF('department')}>
          <option value="">All departments</option>
          {depts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={filters.status} onChange={setF('status')}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Notice message={msg} />
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table
            rows={rows}
            empty="No employees found"
            columns={[
              { label: 'Code', key: 'code' },
              { label: 'Name', render: (r) => <Link className="font-medium text-teal-700 underline" to={`/employees/${r._id}`}>{r.name}</Link> },
              { label: 'Email', key: 'email' },
              { label: 'Department', render: (r) => r.department?.name || '-' },
              { label: 'Designation', render: (r) => r.designation?.name || '-' },
              { label: 'Joined', render: (r) => fmtDate(r.joiningDate) },
              { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            ]}
          />
          <Pagination page={page} pages={data?.pages || data?.totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={!!importResult} onClose={() => setImportResult(null)} title={importResult?.dryRun ? 'CSV dry run' : 'CSV import result'}>
        {errors.length === 0 ? (
          <div className="space-y-3 text-sm">
            <p>{importResult?.dryRun ? 'No errors found. Ready to import.' : 'Import finished.'}</p>
            {importResult?.dryRun && pendingFile && (
              <button className="btn w-full" disabled={busy} onClick={() => runImport(pendingFile, false)}>
                {busy ? 'Importing...' : 'Confirm import'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="text-red-600">{errors.length} problem(s) found. Fix the CSV and try again.</p>
            <Table
              rowKey="row"
              rows={errors.map((x, i) => ({ ...x, _id: i }))}
              columns={[
                { label: 'Row', key: 'row' },
                { label: 'Field', key: 'field' },
                { label: 'Reason', key: 'reason' },
              ]}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
