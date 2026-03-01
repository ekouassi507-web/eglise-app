import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Statistiques
      </motion.h1>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-gray-500 text-center py-8">
          Les graphiques et statistiques apparaîtront ici
        </p>
      </div>
    </div>
  )
}
