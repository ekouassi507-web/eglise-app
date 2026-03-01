import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus } from 'lucide-react'

export default function Activities() {
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle activité
        </motion.button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-gray-500 text-center py-8">
          Les activités de la semaine apparaîtront ici
        </p>
      </div>
    </div>
  )
}
