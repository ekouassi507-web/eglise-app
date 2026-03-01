import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, Users } from 'lucide-react'
import api from '../../lib/api'


interface Member {
  id: string
  name: string
  phone: string | null
  group: string
  bg: number
  subgroup: string | null
  isActive: boolean
}

const GROUPS = ['PUISSANCE', 'SAGESSE', 'GLOIRE']
const SUBGROUPS = ['LOUANGE', 'FORCE', 'FAUSSES', 'RICHESSES']

export default function Members() {
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group: 'PUISSANCE',
    bg: 1,
    subgroup: ''
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await api.get('/members')
      setMembers(response.data.members || [])
    } catch (error) {
      console.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingMember) {
        await api.put(`/users/${editingMember.id}`, formData)
      } else {
        await api.post('/users', { ...formData, email: `${formData.name.toLowerCase().replace(/\s/g, '.')}@eglise.ci`, password: 'default123' })
      }
      setShowModal(false)
      setEditingMember(null)
      setFormData({ name: '', phone: '', group: 'PUISSANCE', bg: 1, subgroup: '' })
      loadMembers()
    } catch (error) {
      console.error('Failed to save member')
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      phone: member.phone || '',
      group: member.group,
      bg: member.bg,
      subgroup: member.subgroup || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce membre ?')) return
    try {
      await api.delete(`/users/${id}`)
      loadMembers()
    } catch (error) {
      console.error('Failed to delete member')
    }
  }

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Membres
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowModal(true); setEditingMember(null); setFormData({ name: '', phone: '', group: 'PUISSANCE', bg: 1, subgroup: '' }) }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </motion.button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Aucun membre trouvé</p>
            <p className="text-gray-600 text-sm">Ajoutez votre premier membre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Nom</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Téléphone</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Groupe</th>
                  <th className="text-left p-4 text-gray-400 font-medium">BG</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Sous-groupe</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4 font-medium">{member.name}</td>
                    <td className="p-4 text-gray-400">{member.phone || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${member.group === 'PUISSANCE' ? 'bg-blue-500/20 text-blue-400' :
                          member.group === 'SAGESSE' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'}`}>
                        {member.group}
                      </span>
                    </td>
                    <td className="p-4">BG{member.bg}</td>
                    <td className="p-4 text-gray-400">{member.subgroup || '-'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(member)} className="p-2 hover:bg-white/10 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-red-500/10 rounded-lg ml-2">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingMember ? 'Modifier' : 'Ajouter'} un membre
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Groupe</label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">BG</label>
                    <select
                      value={formData.bg}
                      onChange={(e) => setFormData({ ...formData, bg: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      {[1,2,3,4].map(bg => <option key={bg} value={bg}>BG {bg}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Sous-groupe (optionnel)</label>
                  <select
                    value={formData.subgroup}
                    onChange={(e) => setFormData({ ...formData, subgroup: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Aucun</option>
                    {SUBGROUPS.map(sg => <option key={sg} value={sg}>{sg}</option>)}
                  </select>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
                >
                  {editingMember ? 'Enregistrer' : 'Ajouter'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
