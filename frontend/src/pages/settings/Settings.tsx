import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Shield, User, UserCog, Save } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'

interface AppUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  group: string | null
  bg: number | null
}

const ROLES = [
  { key: 'PASTEUR', label: 'Pasteur', desc: 'Accès total' },
  { key: 'RESPONSABLE', label: 'Responsable', desc: 'Un groupe' },
  { key: 'BG_LEADER', label: 'Berger (BG)', desc: 'Un BG' }
]

const GROUPS = ['PUISSANCE', 'SAGESSE', 'GLOIRE']

export default function SettingsPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'BG_LEADER',
    group: '',
    bg: null as number | null,
    password: ''
  })

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = { ...formData, bg: formData.bg || null }
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data)
      } else {
        await api.post('/users/register', data)
      }
      setShowModal(false)
      setEditingUser(null)
      resetForm()
      loadUsers()
    } catch (error) {
      console.error('Failed to save user')
    }
  }

  const handleEdit = (user: AppUser) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, group: user.group || '', bg: user.bg, password: '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cet utilisateur ?')) return
    try { await api.delete(`/users/${id}`); loadUsers() } catch (error) { console.error('Failed to delete user') }
  }

  const resetForm = () => setFormData({ name: '', email: '', phone: '', role: 'BG_LEADER', group: '', bg: null, password: '' })

  const getRoleIcon = (role: string) => {
    if (role === 'PASTEUR') return <Shield className="w-4 h-4" />
    if (role === 'RESPONSABLE') return <UserCog className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">Paramètres</motion.h1>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Utilisateurs</button>
        <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === 'roles' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Configuration</button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Plus className="w-5 h-5" />Nouvel utilisateur
            </motion.button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            {loading ? <p className="text-gray-500 p-8 text-center">Chargement...</p> : (
              <table className="w-full">
                <thead className="bg-white/5"><tr><th className="text-left p-4">Nom</th><th className="text-left p-4">Email</th><th className="text-left p-4">Rôle</th><th className="text-left p-4">Groupe</th><th className="text-left p-4">BG</th><th className="text-right p-4">Actions</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs ${user.role === 'PASTEUR' ? 'bg-red-500/20 text-red-400' : user.role === 'RESPONSABLE' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{user.role}</span></td>
                      <td className="p-4">{user.group || '-'}</td>
                      <td className="p-4">BG{user.bg || '-'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(user)} className="p-2"><Edit2 className="w-4 h-4" /></button>
                        {user.id !== currentUser?.id && <button onClick={() => handleDelete(user.id)} className="p-2 ml-2"><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Rôles</h3>
            <div className="grid md:grid-cols-3 gap-4">{ROLES.map((r) => (<div key={r.key} className="bg-white/5 rounded-xl p-4"><div className="flex items-center gap-2 mb-2">{getRoleIcon(r.key)}<span className="font-medium">{r.label}</span></div><p className="text-sm text-gray-400">{r.desc}</p></div>))}</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Groupes</h3>
            <div className="grid md:grid-cols-3 gap-4">{GROUPS.map((g) => (<div key={g} className="bg-white/5 rounded-xl p-4"><span className="font-medium">{g}</span></div>))}</div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-6"><h2 className="text-xl font-bold">{editingUser ? 'Modifier' : 'Nouvel'} utilisateur</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full p-3 bg-white/5 rounded-xl" />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} className="w-full p-3 bg-white/5 rounded-xl disabled:opacity-50" />
                {!editingUser && <input type="password" placeholder="Mot de passe" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full p-3 bg-white/5 rounded-xl" />}
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value, group: '', bg: null })} className="w-full p-3 bg-white/5 rounded-xl">{ROLES.map((r) => (<option key={r.key} value={r.key}>{r.label}</option>))}</select>
                {(formData.role === 'RESPONSABLE' || formData.role === 'BG_LEADER') && (
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} required className="p-3 bg-white/5 rounded-xl"><option value="">Groupe</option>{GROUPS.map((g) => (<option key={g} value={g}>{g}</option>))}</select>
                    {formData.role === 'BG_LEADER' && <select value={formData.bg || ''} onChange={(e) => setFormData({ ...formData, bg: parseInt(e.target.value) || null })} className="p-3 bg-white/5 rounded-xl"><option value="">BG</option>{[1,2,3,4].map((b) => (<option key={b} value={b}>BG {b}</option>))}</select>}
                  </div>
                )}
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium flex items-center justify-center gap-2"><Save className="w-5 h-5" />{editingUser ? 'Enregistrer' : 'Créer'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
