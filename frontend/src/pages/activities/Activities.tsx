import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'

interface Activity {
  id: string
  day: string
  type: string
  attendees: string
  absentees: string
  listened?: string
  notes?: string
}

const DAYS = [
  { key: 'TUESDAY', label: 'Mardi', time: '19h-20h30', desc: 'Enseignement' },
  { key: 'WEDNESDAY', label: 'Mercredi', time: '19h-20h30', desc: 'Enseignement' },
  { key: 'FRIDAY', label: 'Vendredi', time: '19h-20h30', desc: 'Prière' },
  { key: 'SUNDAY', label: 'Dimanche', time: '9h-13h', desc: 'Culte' }
]

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [formData, setFormData] = useState({
    attendees: [] as string[],
    absentees: [] as string[],
    listened: 0,
    notes: ''
  })

  const getWeekStart = (offset: number) => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7)
    const weekStart = new Date(now.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart.toISOString().split('T')[0]
  }

  useEffect(() => {
    loadActivities()
  }, [weekOffset])

  const loadActivities = async () => {
    try {
      const week = getWeekStart(weekOffset)
      const response = await api.get(`/activities?week=${week}`)
      setActivities(response.data || [])
    } catch (error) {
      console.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getActivityForDay = (day: string) => {
    return activities.find(a => a.day === day)
  }

  const handleOpenModal = (day: string) => {
    const existing = getActivityForDay(day)
    if (existing) {
      setFormData({
        attendees: JSON.parse(existing.attendees || '[]'),
        absentees: JSON.parse(existing.absentees || '[]'),
        listened: existing.listened ? JSON.parse(existing.listened).length : 0,
        notes: existing.notes || ''
      })
    } else {
      setFormData({ attendees: [], absentees: [], listened: 0, notes: '' })
    }
    setSelectedDay(day)
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const week = getWeekStart(weekOffset)
      const existing = getActivityForDay(selectedDay)
      
      const data = {
        weekStart: week,
        day: selectedDay,
        type: selectedDay === 'SUNDAY' ? 'SERVICE' : 'TEACHING',
        attendees: formData.attendees,
        absentees: formData.absentees,
        listened: formData.listened > 0 ? Array(formData.listened).fill('') : [],
        notes: formData.notes
      }

      if (existing) {
        await api.put(`/activities/${existing.id}`, data)
      } else {
        await api.post('/activities', data)
      }
      
      setShowModal(false)
      loadActivities()
    } catch (error) {
      console.error('Failed to save activity')
    }
  }

  const weekLabel = () => {
    const start = new Date(getWeekStart(weekOffset))
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `Semaine du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Activités
        </motion.h1>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-4">
        <button 
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">{weekLabel()}</span>
        <button 
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Activities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS.map((day) => {
          const activity = getActivityForDay(day.key)
          const hasData = activity && (JSON.parse(activity.attendees || '[]').length > 0 || JSON.parse(activity.absentees || '[]').length > 0)
          
          return (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-2xl p-6 ${hasData ? 'border-green-500/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                    ${day.key === 'SUNDAY' ? 'bg-yellow-500/20 text-yellow-400' : 
                      day.key === 'FRIDAY' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-blue-500/20 text-blue-400'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{day.label}</h3>
                    <p className="text-xs text-gray-400">{day.time}</p>
                  </div>
                </div>
                {hasData && (
                  <Check className="w-5 h-5 text-green-400" />
                )}
              </div>

              <p className="text-sm text-gray-400 mb-4">{day.desc}</p>

              {hasData ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Présents:</span>
                    <span className="text-green-400 font-medium">
                      {JSON.parse(activity.attendees || '[]').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Absents:</span>
                    <span className="text-red-400 font-medium">
                      {JSON.parse(activity.absentees || '[]').length}
                    </span>
                  </div>
                  {activity.listened && JSON.parse(activity.listened).length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Écoutés:</span>
                      <span className="text-blue-400 font-medium">
                        {JSON.parse(activity.listened).length}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Aucune donnée</p>
              )}

              <button
                onClick={() => handleOpenModal(day.key)}
                className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
              >
                {hasData ? 'Modifier' : 'Remplir'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">
                {DAYS.find(d => d.key === selectedDay)?.label}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nombre de présents</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.attendees.length}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0
                      setFormData({ 
                        ...formData, 
                        attendees: Array(count).fill(''),
                        absentees: formData.absentees.slice(0, Math.max(0, formData.attendees.length - count))
                      })
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nombre d'absents</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.absentees.length}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0
                      setFormData({ 
                        ...formData, 
                        absentees: Array(count).fill('')
                      })
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>

                {selectedDay === 'SUNDAY' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Nombre qui ont écouté (livestream)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.listened}
                      onChange={(e) => setFormData({ ...formData, listened: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/5 rounded-xl hover:bg-white/10"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
