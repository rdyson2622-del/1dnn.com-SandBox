import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = {
  initial_outreach: 'Initial Outreach',
  trust_building: 'Trust Building',
  information_gathering: 'Information Gathering',
  task_coordination: 'Task Coordination',
  follow_up: 'Follow Up',
  charlie_intro: 'Charlie Intro',
};

const CATEGORY_COLORS = {
  initial_outreach: 'bg-blue-100 text-blue-800',
  trust_building: 'bg-green-100 text-green-800',
  information_gathering: 'bg-amber-100 text-amber-800',
  task_coordination: 'bg-purple-100 text-purple-800',
  follow_up: 'bg-slate-100 text-slate-800',
  charlie_intro: 'bg-indigo-100 text-indigo-800',
};

export default function AdminTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'initial_outreach',
    communication_type: 'sms',
    content: '',
    description: '',
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message_templates'],
    queryFn: () => appClient.entities.MessageTemplate.list('-created_date', 200),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const placeholders = extractPlaceholders(data.content);
      return appClient.entities.MessageTemplate.create({
        ...data,
        placeholders,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      setIsFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const placeholders = extractPlaceholders(data.content);
      return appClient.entities.MessageTemplate.update(editingId, {
        ...data,
        placeholders,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.MessageTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'initial_outreach',
      communication_type: 'sms',
      content: '',
      description: '',
      is_active: true,
    });
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name,
      category: template.category,
      communication_type: template.communication_type,
      content: template.content,
      description: template.description || '',
      is_active: template.is_active,
    });
    setEditingId(template.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchType = typeFilter === 'all' || t.communication_type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="px-6 py-4">
          <Link to="/Admin">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900">Message Templates</h1>
              <p className="text-xs text-slate-500 mt-1">Save and reuse SMS/email templates with dynamic placeholders</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> New Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] h-8 text-sm"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-lg bg-white border border-slate-200">
            <p className="font-medium text-slate-900">No templates found</p>
            <p className="text-sm text-slate-500 mt-1">Create your first template to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Name & Category */}
                  <div>
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mt-2 ${CATEGORY_COLORS[template.category]}`}>
                      {CATEGORIES[template.category]}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">{template.communication_type.toUpperCase()}</p>
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <p className="text-sm text-slate-700 line-clamp-2">{template.description || template.content.substring(0, 80)}</p>
                    {template.placeholders?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.placeholders.map((ph) => (
                          <span key={ph} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {'{'}
                            {ph}
                            {'}'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(template.content);
                      }}
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(template.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {previewId === template.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-500 mb-2">PREVIEW:</p>
                    <div className="bg-slate-50 rounded p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {template.content}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., First Contact SMS"
                  required
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={formData.communication_type} onValueChange={(v) => setFormData({ ...formData, communication_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What this template is used for"
              />
            </div>

            <div>
              <Label>Content * (use {`{{owner_name}}`}, {`{{property_address}}`}, etc.)</Label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Hi {`{{owner_name}}`}, we specialize in helping people relocate..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
                rows="8"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                Available placeholders: owner_name, property_address, listing_price, destination_city
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.name || !formData.content}>
                {editingId ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function extractPlaceholders(content) {
  const regex = /\{\{(\w+)\}\}/g;
  const placeholders = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1]);
    }
  }
  return placeholders;
}