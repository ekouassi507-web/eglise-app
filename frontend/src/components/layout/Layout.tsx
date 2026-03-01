import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  BarChart3, Menu, LogOut, Church 
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['PASTEUR', 'RESPONSABLE', 'BG_LEADER'] },
    { path: '/members', icon: Users, label: 'Membres', roles: ['PASTEUR'] },
    { path: '/activities', icon: Calendar, label: 'Activités', roles: ['PASTEUR', 'RESPONSABLE', 'BG_LEADER'] },
    { path: '/reports', icon: FileText, label: 'Rapports', roles: ['PASTEUR', 'RESPONSABLE', 'BG_LEADER'] },
    { path: '/analytics', icon: BarChart3, label: 'Statistiques', roles: ['PASTEUR'] },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Redirect if current path is not accessible
  const currentPath = location.pathname
  const hasAccess = filteredNavItems.some(item => item.path === currentPath)
  
  if (currentPath !== '/' && currentPath !== '/login' && !hasAccess && user) {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Church className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Eglise App</h1>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font flex items-center justify-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/5">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold">Eglise App</span>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
