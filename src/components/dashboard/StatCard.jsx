import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl p-6 transition-all"
      style={{ background: '#111', border: '1px solid #222' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase" style={{ color: '#666' }}>{title}</p>
          <p className="text-3xl font-black mt-1" style={{ color: '#fff' }}>{value}</p>
          {subtitle && <p className="text-xs mt-1" style={{ color: '#555' }}>{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <Icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
        </div>
      </div>
    </motion.div>
  );
}