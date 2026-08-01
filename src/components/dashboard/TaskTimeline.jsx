import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  pending: { icon: Circle, color: 'text-slate-300', bg: 'bg-slate-50' },
  skipped: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
};

const categoryLabels = {
  housing: '🏠 Housing',
  moving: '📦 Moving',
  utilities: '⚡ Utilities',
  schools: '🎓 Schools',
  healthcare: '🏥 Healthcare',
  local_services: '🔧 Services',
  social: '👥 Social',
  employment: '💼 Employment',
  legal: '📋 Legal',
  other: '📌 Other',
};

export default function TaskTimeline({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: '#555' }}>
        No tasks yet. Ask Charlie to create a relocation checklist!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.slice(0, 8).map((task, i) => {
        const config = statusConfig[task.status] || statusConfig.pending;
        const Icon = config.icon;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${config.bg} transition-all hover:scale-[1.01]`}
          >
            <Icon className={`w-5 h-5 ${config.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </p>
              {task.due_date && (
                <p className="text-xs text-slate-400 mt-0.5">{task.due_date}</p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {categoryLabels[task.category] || task.category}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}