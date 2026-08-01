import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Eye, Send, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const categoryLabels = {
  client_intro: 'Client Intro',
  listing_agent: 'Listing Agent',
  receiving_agent: 'Receiving Agent',
  ai_explainer: 'AI Explainer',
  referral_model: 'Referral Model',
  philosophy: 'Philosophy',
  process: 'Process',
  other: 'Other'
};

const categoryColors = {
  client_intro: 'bg-blue-100 text-blue-800',
  listing_agent: 'bg-amber-100 text-amber-800',
  receiving_agent: 'bg-green-100 text-green-800',
  ai_explainer: 'bg-purple-100 text-purple-800',
  referral_model: 'bg-red-100 text-red-800',
  philosophy: 'bg-indigo-100 text-indigo-800',
  process: 'bg-slate-100 text-slate-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function AdminPresentationLibrary() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [viewingSlide, setViewingSlide] = useState(0);
  const queryClient = useQueryClient();

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ['presentations'],
    queryFn: () => appClient.entities.Presentation.list('-last_updated', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.Presentation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Presentation deleted');
      setSelectedId(null);
    }
  });

  const filtered = presentations.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = presentations.find(p => p.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Presentation Library</h1>
            <p className="text-sm text-slate-500 mt-1">Central hub for client, agent, and internal presentations</p>
          </div>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
          <Plus className="w-4 h-4" />
          New Presentation
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Library List */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b">
              <Input
                placeholder="Search presentations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div className="divide-y max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No presentations found
                </div>
              ) : (
                filtered.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setViewingSlide(0); }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${
                      selectedId === p.id ? 'bg-slate-50 border-l-slate-900' : 'border-l-slate-200'
                    }`}
                  >
                    <h3 className="font-semibold text-sm text-slate-900">{p.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge className={categoryColors[p.category]}>
                        {categoryLabels[p.category]}
                      </Badge>
                      <span className="text-xs text-slate-400">{p.slides?.length || 0} slides</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview & Details */}
        {selected ? (
          <div className="col-span-2 space-y-4">
            {/* Slide Viewer */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{selected.purpose}</p>
              </div>

              {selected.slides && selected.slides.length > 0 ? (
                <div className="space-y-4">
                  {/* Current Slide */}
                  <div className="bg-slate-50 rounded-lg p-8 min-h-96 border border-slate-200 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {selected.slides[viewingSlide]?.title}
                    </h3>
                    <div className="text-slate-700 mb-6 flex-1">
                      {selected.slides[viewingSlide]?.image_url && (
                        <img
                          src={selected.slides[viewingSlide].image_url}
                          alt="Slide"
                          className="w-full h-48 object-cover rounded mb-4"
                        />
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selected.slides[viewingSlide]?.content}
                      </p>
                    </div>
                    {selected.slides[viewingSlide]?.notes && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 font-semibold mb-1">NOTES</p>
                        <p className="text-xs text-slate-600">{selected.slides[viewingSlide].notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewingSlide(Math.max(0, viewingSlide - 1))}
                        disabled={viewingSlide === 0}
                      >
                        ← Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setViewingSlide(Math.min(selected.slides.length - 1, viewingSlide + 1))}
                        disabled={viewingSlide === selected.slides.length - 1}
                      >
                        Next →
                      </Button>
                    </div>
                    <span className="text-sm text-slate-500">
                      Slide {viewingSlide + 1} of {selected.slides.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No slides in this presentation
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4" />
                Full Presentation
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Send as Link
              </Button>
              <Button variant="outline" size="icon">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (confirm('Delete this presentation?')) {
                    deleteMutation.mutate(selectedId);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 flex items-center justify-center min-h-96">
            <div className="text-center text-slate-400">
              <p className="text-sm">Select a presentation to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}