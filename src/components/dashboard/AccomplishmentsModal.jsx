import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const GOLD = '#D4AF37';

export default function AccomplishmentsModal({ open, onClose, tasks = [] }) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const accomplishmentRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const accomplishments = completedTasks.map(task => ({
    id: task.id,
    title: task.title,
    category: task.category,
    beforeState: `Needed to handle: ${task.title}`,
    afterState: `✓ ${task.title} — Complete`,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden" style={{ background: '#0a0a0a', border: `1px solid ${GOLD}` }}>
        {/* Header */}
        <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between shrink-0 frosted-gold" style={{ borderBottom: `1px solid rgba(212,175,55,0.2)` }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: GOLD }}>Your Progress</h2>
            <p className="text-xs mt-1" style={{ color: '#888' }}>{completedTasks.length} of {totalTasks} tasks accomplished</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" style={{ color: '#888' }}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="px-6 py-4 border-b" style={{ borderColor: '#222' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-3xl font-black" style={{ color: GOLD }}>{accomplishmentRate}%</div>
              <p className="text-xs mt-1" style={{ color: '#888' }}>Complete</p>
            </div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: `2px solid ${GOLD}` }}>
              <div className="text-center">
                <div className="text-xl font-black" style={{ color: GOLD }}>{completedTasks.length}</div>
                <p className="text-xs mt-1" style={{ color: '#888' }}>Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accomplishments Timeline */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="px-6 py-6 space-y-4">
            <AnimatePresence>
              {accomplishments.length > 0 ? (
                accomplishments.map((acc, i) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="space-y-2"
                  >
                    {/* Before */}
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#333' }}>
                        <Target className="w-3.5 h-3.5" style={{ color: '#666' }} />
                      </div>
                      <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                        {acc.beforeState}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center py-1">
                      <ArrowRight className="w-4 h-4" style={{ color: GOLD }} />
                    </div>

                    {/* After */}
                    <div className="flex gap-3 justify-end mb-4">
                      <div className="rounded-2xl px-4 py-2.5 text-sm font-semibold max-w-xs" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid ${GOLD}`, color: GOLD }}>
                        {acc.afterState}
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(212,175,55,0.2)' }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: GOLD }} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Target className="w-8 h-8 mx-auto mb-3" style={{ color: '#444' }} />
                  <p style={{ color: '#666' }}>No completed tasks yet. Keep building your relocation journey!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}