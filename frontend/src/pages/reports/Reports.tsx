import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'

interface Report {
  id: string
  bergerId: string
  berger?: { name: string }
  weekStart: string
  weekEnd: string
  personalLife: string
  tuesdayMobilized: boolean
  tuesdayCount: number
  wednesdayMobilized: boolean
  wednesdayCount: number
  fridayMobilized: boolean
  fridayCount: number
  sundayMobilized: boolean
  sundayCount: number
  sundayListened: number
  monthlyActivities: string
  prayerChains: string
  qiQuotidien: boolean
  qiIntermittent: boolean
  bookToStudy: string
  absencesNames: string
  supervisionTheme: string
  visitedPersons: string
  visitPurpose: string
  visitDate: string
  otherObservations: string
  signature: boolean
  signedAt: string | null
  status: string
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const getWeekStart = (offset: number) => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7)
    const weekStart = new Date(now.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart.toISOString().split('T')[0]
  }

  const getWeekEnd = (offset: number) => {
    const start = new Date(getWeekStart(offset))
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return end.toISOString().split('T')[0]
  }

  useEffect(() => {
    loadReports()
  }, [weekOffset])

  const loadReports = async () => {
    try {
      const response = await api.get('/reports')
      setReports(response.data || [])
    } catch (error) {
      console.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      weekStart: getWeekStart(weekOffset),
      weekEnd: getWeekEnd(weekOffset),
      personalLife: formData.get('personalLife'),
      tuesdayMobilized: formData.get('tuesdayMobilized') === 'on',
      tuesdayCount: parseInt(formData.get('tuesdayCount') as string) || 0,
      wednesdayMobilized: formData.get('wednesdayMobilized') === 'on',
      wednesdayCount: parseInt(formData.get('wednesdayCount') as string) || 0,
      fridayMobilized: formData.get('fridayMobilized') === 'on',
      fridayCount: parseInt(formData.get('fridayCount') as string) || 0,
      sundayMobilized: formData.get('sundayMobilized') === 'on',
      sundayCount: parseInt(formData.get('sundayCount') as string) || 0,
      sundayListened: parseInt(formData.get('sundayListened') as string) || 0,
      monthlyActivities: formData.get('monthlyActivities'),
      prayerChains: formData.get('prayerChains'),
      qiQuotidien: formData.get('qiQuotidien') === 'on',
      qiIntermittent: formData.get('qiIntermittent') === 'on',
      bookToStudy: formData.get('bookToStudy'),
      absencesNames: formData.get('absencesNames'),
      supervisionTheme: formData.get('supervisionTheme'),
      visitedPersons: formData.get('visitedPersons'),
      visitPurpose: formData.get('visitPurpose'),
      visitDate: formData.get('visitDate'),
      otherObservations: formData.get('otherObservations'),
      signature: true
    }

    try {
      await api.post('/reports', data)
      setShowModal(false)
      loadReports()
    } catch (error) {
      console.error('Failed to submit report')
    }
  }

  const downloadPDF = async (reportId: string) => {
    try {
      const response = await api.get(`/reports/${reportId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport-berger-${reportId}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      console.error('Failed to download PDF')
    }
  }

  const weekLabel = () => {
    const start = new Date(getWeekStart(weekOffset))
    const end = new Date(getWeekEnd(weekOffset))
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
          Rapports Hebdomadaires
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau rapport
        </motion.button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-4">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 hover:bg-white/10 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">{weekLabel()}</span>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 hover:bg-white/10 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reports List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : reports.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Aucun rapport pour cette semaine</p>
          </div>
        ) : (
          reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${report.signature ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Rapport Berger</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(report.weekStart).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {report.signature && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Signé
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mardi:</span>
                  <span>{report.tuesdayCount} présents</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mercredi:</span>
                  <span>{report.wednesdayCount} présents</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendredi:</span>
                  <span>{report.fridayCount} présents</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dimanche:</span>
                  <span>{report.sundayCount} présents</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => downloadPDF(report.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal - New Report Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-2xl my-8"
            >
              <h2 className="text-xl font-bold mb-6">Rapport Hebdomadaire du Berger</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Week Info */}
                <div className="text-sm text-gray-400 mb-4">
                  Semaine du {getWeekStart(weekOffset)} au {getWeekEnd(weekOffset)}
                </div>

                {/* Vie Personnelle */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Vie personnelle</label>
                  <textarea name="personalLife" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                </div>

                {/* Travail du Berger - Mobilisation */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Travail du Berger - Mobilisation</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="tuesdayMobilized" id="tuesdayMobilized" className="w-4 h-4" />
                      <label htmlFor="tuesdayMobilized" className="text-sm">Mardi mobilisé</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nombre présents</label>
                      <input type="number" name="tuesdayCount" defaultValue={0} min={0} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="wednesdayMobilized" id="wednesdayMobilized" className="w-4 h-4" />
                      <label htmlFor="wednesdayMobilized" className="text-sm">Mercredi mobilisé</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nombre présents</label>
                      <input type="number" name="wednesdayCount" defaultValue={0} min={0} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="fridayMobilized" id="fridayMobilized" className="w-4 h-4" />
                      <label htmlFor="fridayMobilized" className="text-sm">Vendredi mobilisé</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nombre présents</label>
                      <input type="number" name="fridayCount" defaultValue={0} min={0} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="sundayMobilized" id="sundayMobilized" className="w-4 h-4" />
                      <label htmlFor="sundayMobilized" className="text-sm">Dimanche cult</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Présents</label>
                      <input type="number" name="sundayCount" defaultValue={0} min={0} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Ont écouté</label>
                      <input type="number" name="sundayListened" defaultValue={0} min={0} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Programme Eglise */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Programme Eglise</h3>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Activités mensuelles</label>
                    <input type="text" name="monthlyActivities" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Chaînes de prière</label>
                    <input type="text" name="prayerChains" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="qiQuotidien" id="qiQuotidien" className="w-4 h-4" />
                      <label htmlFor="qiQuotidien" className="text-sm">QI - Quotidien</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="qiIntermittent" id="qiIntermittent" className="w-4 h-4" />
                      <label htmlFor="qiIntermittent" className="text-sm">QI - Intermittent</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Livre à étudier</label>
                    <input type="text" name="bookToStudy" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>
                </div>

                {/* Absences */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Noms des absents et raisons</label>
                  <textarea name="absencesNames" rows={2} placeholder="Nom - Raison" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                </div>

                {/* Encadrement */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Encadrement / Visites</h3>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Thème d'encadrement</label>
                    <input type="text" name="supervisionTheme" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Personnes visitées</label>
                      <input type="text" name="visitedPersons" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Objet de la visite</label>
                      <input type="text" name="visitPurpose" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Date et Heure de la visite</label>
                    <input type="text" name="visitDate" placeholder="Ex: 15/02/2024 à 14h00" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                  </div>
                </div>

                {/* Autres Observations */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Autres observations</label>
                  <textarea name="otherObservations" rows={2} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                </div>

                {/* Signature */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <input type="checkbox" name="signature" id="signature" required className="w-5 h-5" />
                  <label htmlFor="signature" className="text-sm">
                    Je certifie que les informations ci-dessus sont exactes et sincères
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-white/5 rounded-xl hover:bg-white/10"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
                  >
                    Soumettre le rapport
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
