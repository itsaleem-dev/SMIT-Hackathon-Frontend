import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

import Setup from './pages/shared/Setup.jsx'
import Login from './pages/shared/Login.jsx'
import ChangePassword from './pages/shared/ChangePassword.jsx'
import Dashboard from './pages/shared/Dashboard.jsx'
import Attendance from './pages/shared/Attendance.jsx'
import Announcements from './pages/shared/Announcements.jsx'
import Notifications from './pages/shared/Notifications.jsx'
import AiAssistant from './pages/shared/AiAssistant.jsx'
import Payslips from './pages/shared/Payslips.jsx'
import NotFound from './pages/shared/NotFound.jsx'

import CompanySettings from './pages/admin/CompanySettings.jsx'
import OrgSetup from './pages/admin/OrgSetup.jsx'
import Users from './pages/admin/Users.jsx'
import AuditLog from './pages/admin/AuditLog.jsx'

import Employees from './pages/hr/Employees.jsx'
import EmployeeForm from './pages/hr/EmployeeForm.jsx'
import Employee360 from './pages/hr/Employee360.jsx'
import Corrections from './pages/hr/Corrections.jsx'
import LeaveApprovals from './pages/hr/LeaveApprovals.jsx'
import Payroll from './pages/hr/Payroll.jsx'
import PayrollDetail from './pages/hr/PayrollDetail.jsx'

import Profile from './pages/employee/Profile.jsx'
import LeaveApply from './pages/employee/LeaveApply.jsx'
import MyLeaves from './pages/employee/MyLeaves.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/ai" element={<AiAssistant />} />
              <Route path="/payslips" element={<Payslips />} />

              <Route element={<ProtectedRoute roles={['admin', 'hr']} />}>
                <Route path="/settings" element={<CompanySettings />} />
                <Route path="/org" element={<Navigate to="/org/departments" replace />} />
                <Route path="/org/:tab" element={<OrgSetup />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<Employee360 />} />
                <Route path="/corrections" element={<Corrections />} />
                <Route path="/leaves/approvals" element={<LeaveApprovals />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/payroll/:id" element={<PayrollDetail />} />
              </Route>

              <Route element={<ProtectedRoute roles={['hr']} />}>
                <Route path="/employees/new" element={<EmployeeForm />} />
                <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/audit" element={<AuditLog />} />
              </Route>

              <Route element={<ProtectedRoute roles={['employee']} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaves" element={<MyLeaves />} />
                <Route path="/leaves/apply" element={<LeaveApply />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
