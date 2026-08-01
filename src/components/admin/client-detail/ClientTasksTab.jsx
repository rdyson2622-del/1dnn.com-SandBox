import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { CheckCircle2, Circle, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const GOLD = '#D4AF37';

const priorityColors = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const categoryColors = {
  housing: '#3b82f6',
  moving: '#8b5cf6',
  utilities: '#f59e0b',
  schools: '#10b981',
  healthcare: '#ef4444',
  legal: '#6366f1',
  employment: '#0ea5e9',
  social: '#ec4899',
  other: '#94a3b8',
};

export default function ClientTasksTab({ client }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'other', priority: 'medium', due_date: '', description: '' });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['client-tasks', client.id],
    queryFn: () => appClient.entities.RelocationTask.filter({ client_id: client.id }, '-created_date', 200),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['client-tasks', client.id] });

  const toggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await appClient.entities.RelocationTask.update(task.id, {
      status: newStatus,
      completed_date: newStatus === 'completed' ? new Date().toISOString() : null,
    });
    refresh();
  };

  const deleteTask = async (taskId) => {
    await appClient.entities.RelocationTask.delete(taskId);
    refresh();
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    await appClient.entities.RelocationTask.create({ ...newTask, client_id: client.id });
    setNewTask({ title: '', category: 'other', priority: 'medium', due_date: '', description: '' });
    setShowAdd(false);
    refresh();
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const pending = tasks.filter(t => t.status !== 'completed');
  const done = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base" style={{ color: '#000' }}>Move Plan Tasks</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{completed} of {tasks.length} completed</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} style={{ background: GOLD, color: '#000' }} className="gap-1.5 font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: GOLD, width: `${pct}%` }} />
        </div>
        <p className="text-xs mt-1 text-right font-medium" style={{ color: GOLD }}>{pct}%</p>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.95)', borderColor: `${GOLD}44` }}>
          <h3 className="font-bold text-sm" style={{ color: '#000' }}>New Task</h3>
          <Input placeholder="Task title..." value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['housing','moving','utilities','schools','healthcare','legal','employment','social','other'].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v }))}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} className="text-xs" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={addTask} style={{ background: GOLD, color: '#000' }}>Add Task</Button>
          </div>
        </div>
      )}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'rgba(0,0,0,0.06)', color: GOLD, background: '#fafafa' }}>
            Pending ({pending.length})
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            {pending.map(task => (
              <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                  <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#000' }}>{task.title}</p>
                  {task.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.5)' }}>{task.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${categoryColors[task.category] || '#94a3b8'}18`, color: categoryColors[task.category] || '#94a3b8' }}>
                      {task.category?.replace(/_/g, ' ')}
                    </span>
                    <Badge className={`${priorityColors[task.priority]} border-0 text-xs`}>{task.priority}</Badge>
                    {task.due_date && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="rounded-2xl border overflow-hidden opacity-70" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'rgba(0,0,0,0.06)', color: '#10b981', background: '#f0fdf4' }}>
            Completed ({done.length})
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            {done.map(task => (
              <div key={task.id} className="flex items-start gap-3 px-5 py-3">
                <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through" style={{ color: 'rgba(0,0,0,0.4)' }}>{task.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !isLoading && (
        <div className="rounded-2xl border p-10 text-center" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <p className="font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>No tasks yet</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>Add tasks to build this client's move plan.</p>
        </div>
      )}
    </div>
  );
}