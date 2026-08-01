import React from 'react';
import { CheckCircle2, Circle, Home, Zap, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  housing: Home,
  moving: Zap,
  schools: BookOpen,
  utilities: FileText,
  healthcare: FileText,
  legal: FileText,
  employment: FileText,
  social: FileText,
  local_services: FileText,
  other: Circle,
};

const categoryColors = {
  housing: '#FF6B6B',
  moving: '#4ECDC4',
  schools: '#45B7D1',
  utilities: '#FFA07A',
  healthcare: '#98D8C8',
  legal: '#F7DC6F',
  employment: '#BB8FCE',
  social: '#85C1E2',
  local_services: '#F8B88B',
  other: '#95A5A6',
};

export default function MoveActionSteps({ tasks, campaign }) {
  if (!tasks || tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6"
        style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <h2 className="font-semibold mb-4" style={{ color: '#000' }}>Move Action Plan</h2>
        <p className="text-sm text-gray-500">No action steps yet. They'll be created when Gemini interview is complete.</p>
      </motion.div>
    );
  }

  const grouped = tasks.reduce((acc, task) => {
    const cat = task.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6"
      style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
    >
      <h2 className="font-semibold mb-4" style={{ color: '#000' }}>Move Action Plan</h2>
      <p className="text-xs text-gray-500 mb-6">
        {tasks.filter(t => t.status === 'completed').length} of {tasks.length} completed
      </p>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, catTasks]) => {
          const Icon = categoryIcons[category] || Circle;
          const color = categoryColors[category] || '#95A5A6';

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color }} />
                <h3 className="text-sm font-semibold capitalize" style={{ color: '#000' }}>
                  {category.replace('_', ' ')}
                </h3>
              </div>

              <div className="space-y-2 ml-6">
                {catTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          task.status === 'completed' ? 'line-through text-gray-400' : ''
                        }`}
                        style={{ color: task.status === 'completed' ? '#999' : '#000' }}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-400 mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}