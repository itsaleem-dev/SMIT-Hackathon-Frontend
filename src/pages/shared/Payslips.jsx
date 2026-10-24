import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { errMsg } from '../../api/client'
import E from '../../api/endpoints'
import useFetch, { listOf } from '../../components/useFetch'
import { ErrorBox, PageHeader, Spinner, Table, money } from '../../components/ui'

export default function Payslips() {
  const { user } = useAuth()
  const isEmp = user.role === 'employee'
  const [month, setMonth] = useState('')
  const url = isEmp ? E.payslipsMy : `${E.payroll}/payslips`
  const { data, loading, error, reload } = useFetch(url, month ? { month } : {})
  const rows = listOf(data, 'payslips')
  const [err, setErr] = useState('')

  const download = async (p) => {
    setErr('')
    try {
      const res = await api.get(`${E.payroll}/payslips/${p._id}/pdf`, { responseType: 'blob' })
      const href = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = href
      a.download = `payslip-${p.month || p._id}.pdf`
      a.click()
      URL.revokeObjectURL(href)
    } catch (e) {
      setErr(errMsg(e))
    }
  }

  const cols = [
    { label: 'Month', key: 'month' },
    ...(!isEmp ? [{ label: 'Employee', render: (r) => r.employee?.name || r.name || '-' }] : []),
    { label: 'Gross', render: (r) => money(r.gross) },
    { label: 'Deductions', render: (r) => money(r.deductions ?? r.totalDeductions) },
    { label: 'Tax', render: (r) => money(r.tax) },
    { label: 'Net', render: (r) => <span className="font-semibold">{money(r.net)}</span> },
    {
      label: '',
      render: (r) => (
        <button className="btn-outline" onClick={() => download(r)}>
          Download PDF
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={isEmp ? 'My Payslips' : 'Payslips'} subtitle="Finalized payroll payslips">
        <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
      </PageHeader>
      <ErrorBox message={error || err} onRetry={reload} />
      {loading ? <Spinner /> : <Table rows={rows} columns={cols} empty="No payslips yet" />}
    </>
  )
}
