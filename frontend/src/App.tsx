import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Members from './pages/members/Members'
import Activities from './pages/activities/Activities'
import Reports from './pages/reports/Reports'
import Analytics from './pages/analytics/Analytics'
import Layout from './components/layout/Layout'

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { isAuthenticated } = useAuthStore()
  const user = useAuthStore.getState().user
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }
  
  // If role is required and user doesn't have it (except PASTEUR who has access to everything)
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'PASTEUR') {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/members" element={
                  <PrivateRoute requiredRole="PASTEUR">
                    <Members />
                  </PrivateRoute>
                } />
                <Route path="/activities" element={
                  <PrivateRoute>
                    <Activities />
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } />
                <Route path="/analytics" element={
                  <PrivateRoute requiredRole="PASTEUR">
                    <Analytics />
                  </PrivateRoute>
                } />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
