import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Check, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TASK_ICONS = {
  order_title_report: '📋',
  schedule_call: '📞',
  verify_moving_details: '✓',
  send_follow_up: '✉️',
  prepare_proposal: '📄',
  agent_match: '🤝',
  check_response: '📬',
  update_notes: '📝',
  send_destination_info: '🗺️',
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function OutreachTaskList({ campaign_id }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['outreach_tasks', campaign_id],
    queryFn: () =>
      appClient.entities.OutreachTask.filter(
        { campaign_id },
        '-created_date',
        100
      ),
    initialData: [],
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ task_id, status }) =>
      appClient.entities.OutreachTask.update(task_id, {
        status,
        completed_date: status === 'completed' ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach_tasks', campaign_id] });
    },
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500">GENERATED TASKS</p>
          <span className="text-xs font-semibold text-slate-600">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-green-500"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-lg border transition-all ${
              task.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Status Button */}
              <button
                onClick={() => {
                  const nextStatus =
                    task.status === 'pending'
                      ? 'in_progress'
                      : task.status === 'in_progress'
                      ? 'completed'
                      : 'pending';
                  updateTaskStatus.mutate({ task_id: task.id, status: nextStatus });
                }}
                className={`mt-1 shrink-0 rounded p-1 transition-colors ${
                  task.status === 'pending'
                    ? 'hover:bg-slate-200'
                    : task.status === 'in_progress'
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'bg-green-500 text-white'
                }`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{TASK_ICONS[task.task_type] || '•'}</span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        task.status === 'completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {task.due_date && (
                        <span className="text-xs text-slate-600">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          PRIORITY_COLORS[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}