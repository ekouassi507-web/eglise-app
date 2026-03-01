import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Calendar, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'


export default function Analytics() {
  const [stats, setStats] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [evolution, setEvolution] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [overviewRes, groupsRes, evolutionRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/groups'),
        api.get('/analytics/evolution')
      ])
      setStats(overviewRes.data)
      setGroups(groupsRes.data)
      setEvolution(evolutionRes.data)
    } catch (error) {
      console.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const groupData = groups.map(g => ({
    name: g.name,
    members: g.totalMembers
  }))

  const attendanceData = evolution.map(e => ({
    semaine: e.week,
    presence: e.totalAttendance
  }))

  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Statistiques
      </motion.h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Total Membres</span>
              </div>
              <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Activités (7j)</span>
              </div>
              <p className="text-3xl font-bold">{stats?.recentActivities || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Rapports (7j)</span>
              </div>
              <p className="text-3xl font-bold">{stats?.recentReports || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Evolution</span>
              </div>
              <p className="text-3xl font-bold">
                {evolution.length > 1 && evolution[0].totalAttendance > evolution[1].totalAttendance ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <ArrowUp className="w-5 h-5" />
                    +{Math.round((evolution[0].totalAttendance - evolution[1].totalAttendance) / Math.max(evolution[1].totalAttendance, 1) * 100)}%
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <ArrowDown className="w-5 h-5" />
                    {Math.round((evolution[0].totalAttendance - evolution[1].totalAttendance) / Math.max(evolution[1].totalAttendance, 1) * 100)}%
                  </span>
                )}
              </p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Members by Group */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Membres par Groupe
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={groupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="members" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Attendance Evolution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Evolution des Présences
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="semaine" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="presence" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Group Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Détails par Groupe</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.name} className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-medium mb-3">{group.name}</h3>
                  <div className="space-y-2">
                    {group.bg.map((bg: any) => (
                      <div key={bg.bg} className="flex justify-between text-sm">
                        <span className="text-gray-400">BG{bg.bg}:</span>
                        <span>{bg.count} membres</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-blue-400">{group.totalMembers}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
