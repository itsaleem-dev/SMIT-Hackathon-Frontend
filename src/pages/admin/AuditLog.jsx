import { useState } from 'react'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { ErrorBox, Modal, PageHeader, Pagination, Spinner, Table, fmtDate, fmtTime } from '../../components/ui'

export default function AuditLog() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ action: '', entity: '' })
  const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
  const { data, loading, error, reload } = useFetch(E.audit, params)
  const rows = listOf(data, 'logs')
  const [detail, setDetail] = useState(null)

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Read-only record of important actions">
        <input
          className="input w-40"
          placeholder="Action"
          value={filters.action}
          onChange={(e) => {
            setPage(1)
            setFilters({ ...filters, action: e.target.value })
          }}
        />
        <input
          className="input w-40"
          placeholder="Entity"
          value={filters.entity}
          onChange={(e) => {
            setPage(1)
            setFilters({ ...filters, entity: e.target.value })
          }}
        />
      </PageHeader>
      <ErrorBox message={error} onRetry={reload} />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table
            rows={rows}
            empty="No audit entries yet"
            columns={[
              { label: 'When', render: (r) => `${fmtDate(r.createdAt)} ${fmtTime(r.createdAt)}` },
              { label: 'Actor', render: (r) => r.actor?.name || r.actor?.email || r.actor || '-' },
              { label: 'Action', key: 'action' },
              { label: 'Entity', render: (r) => `${r.entity || '-'}${r.entityId ? ` #${String(r.entityId).slice(-6)}` : ''}` },
              {
                label: '',
                render: (r) => (
                  <button className="text-sm text-teal-600 underline" onClick={() => setDetail(r)}>
                    Before / after
                  </button>
                ),
              },
            ]}
          />
          <Pagination page={page} pages={data?.pages || data?.totalPages} onChange={setPage} />
        </>
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Change details">
        <div className="space-y-3 text-xs">
          <div>
            <div className="mb-1 font-semibold">Before</div>
            <pre className="overflow-x-auto rounded bg-slate-100 p-2">{JSON.stringify(detail?.before ?? null, null, 2)}</pre>
          </div>
          <div>
            <div className="mb-1 font-semibold">After</div>
            <pre className="overflow-x-auto rounded bg-slate-100 p-2">{JSON.stringify(detail?.after ?? null, null, 2)}</pre>
          </div>
        </div>
      </Modal>
    </>
  )
}
