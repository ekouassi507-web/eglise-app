import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, FileText, TrendingUp, Church, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import api from '../../lib/api'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/analytics/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Membres',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      href: '/members'
    },
    {
      title: 'Activités',
      value: stats?.recentActivities || 0,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      href: '/activities'
    },
    {
      title: 'Rapports',
      value: stats?.recentReports || 0,
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      href: '/reports'
    },
    {
      title: 'Evolution',
      value: '+12%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      href: '/analytics'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-gray-400">
          Bienvenue sur Eglise App - Gestion des activités
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.a
            key={card.title}
            href={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card rounded-2xl p-6 group cursor-pointer"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm">{card.title}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </motion.a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Chargement...</p>
            ) : (
              [
                { day: 'Dimanche', count: stats?.attendanceByDay?.find((a: any) => a.day === 'SUNDAY')?._count || 0 },
                { day: 'Vendredi', count: stats?.attendanceByDay?.find((a: any) => a.day === 'FRIDAY')?._count || 0 },
                { day: 'Mercredi', count: stats?.attendanceByDay?.find((a: any) => a.day === 'WEDNESDAY')?._count || 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300">{item.day}</span>
                  <span className="font-semibold text-blue-400">{item.count} activités</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            {[
              { label: 'Nouveau rapport hebdomadaire', href: '/reports', icon: FileText },
              { label: 'Ajouter un membre', href: '/members', icon: Users },
              { label: 'Enregistrer une activité', href: '/activities', icon: Calendar },
              { label: 'Voir les statistiques', href: '/analytics', icon: TrendingUp },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <action.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                  {action.label}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
