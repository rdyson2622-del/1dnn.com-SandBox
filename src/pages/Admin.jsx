import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Home, UserCheck, Search, SendHorizontal, Flag, MessageCircle, FileText, Link as LinkIcon, ScrollText, ArrowRight, Download,
  Brain, AlertTriangle, Sparkles, TrendingUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GOLD = '#D4AF37';

const adminSections = [
  {
    heading: 'QUICK SEARCHES',
    color: GOLD,
    modules: [
      { name: 'Search Listing Profiles', path: '/admin/search-profiles', icon: Search, description: 'Find and manage property search profiles', color: '#3B82F6' },
      { name: 'Skip Trace Lookup', path: '/admin/skip-trace', icon: Search, description: 'Find owner name & contact info by property address via BatchData', color: '#D4AF37' },
      { name: 'Outreach Pipeline', path: '/admin/outreach-pipeline', icon: SendHorizontal, description: 'Monitor outreach workflow stages', color: '#F59E0B' },
      { name: 'Compose SMS', path: '/admin/compose-sms', icon: MessageCircle, description: 'Send SMS campaigns to owners', color: '#06B6D4' },
      { name: 'Owner Response Board', path: '/admin/owner-kanban', icon: Home, description: 'View owner responses and engagement', color: '#10B981' },
      { name: 'Batch SMS Logs', path: '/admin/batch-sms-log', icon: Download, description: 'View sent batch SMS history', color: '#22C55E' },
    ]
  },
  {
    heading: 'MARKETING CAMPAIGNS',
    color: GOLD,
    modules: [
      { name: 'Scheduled Campaigns', path: '/admin/scheduled-campaigns', icon: ScrollText, description: 'Schedule and manage SMS campaigns', color: '#F97316' },
      { name: 'Outreach Analytics', path: '/admin/outreach-analytics', icon: Sparkles, description: 'Track campaign performance metrics', color: '#EC4899' },
      { name: 'SMS Sequences', path: '/admin/sms-sequences', icon: SendHorizontal, description: 'Build multi-step SMS sequences', color: '#06B6D4' },
    ]
  },
  {
    heading: 'RESULTS',
    color: GOLD,
    modules: [
      { name: 'Listing Owners Info', path: '/admin/owners', icon: Home, description: 'View and manage listing owner database', color: '#10B981' },
      { name: 'Clients', path: '/admin/clients', icon: UserCheck, description: 'View relocation leads and track progress', color: '#8B5CF6' },
    ]
  },
  {
    heading: 'OPERATIONS',
    color: GOLD,
    modules: [
      { name: 'Presentation Library', path: '/admin/presentation-library', icon: FileText, description: 'Manage presentations and slide decks', color: '#EC4899' },
      { name: 'Flagged Messages', path: '/admin/flagged-conversations', icon: Flag, description: 'Review flagged conversations', color: '#EF4444' },
      { name: 'Referral Management', path: '/admin/referrals', icon: LinkIcon, description: 'Track agent referrals and fees', color: '#14B8A6' },
    ]
  },
];

function LiveStatCard({ label, icon: Icon, path, query, filter, accentColor }) {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-stat', label],
    queryFn: query,
    refetchInterval: 30000,
  });

  const items = filter ? data.filter(filter) : data;
  const count = items.length;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={() => navigate(path)}
      className="rounded-2xl p-4 cursor-pointer transition-all group"
      style={{ background: '#000', border: `1px solid ${accentColor || 'rgba(212,175,55,0.2)'}33` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: accentColor || GOLD }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        {isLoading ? (
          <div className="w-8 h-7 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
        ) : (
          <p className="text-2xl font-bold" style={{ color: accentColor || '#fff' }}>{count}</p>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold" style={{ color: accentColor || GOLD }}>View →</span>
        </div>
      </div>

      {/* Preview of items */}
      {!isLoading && items.length > 0 && (
        <div className="mt-3 space-y-1">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] rounded-lg px-2 py-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-1 h-1 rounded-full shrink-0" style={{ background: accentColor || GOLD }} />
              <span className="truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {item._preview}
              </span>
              {item._badge && (
                <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: `${accentColor}22`, color: accentColor }}>
                  {item._badge}
                </span>
              )}
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-[10px] px-2 pt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              +{items.length - 3} more — click to view all
            </p>
          )}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Nothing pending</p>
      )}
    </motion.div>
  );
}

export default function Admin() {
  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>ADMIN COMMAND CENTER</p>
          <h1 className="display-heading mb-2 whitespace-nowrap" style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', color: '#fff' }}>Dyson & Dyson Admin Dashboard</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Live stats below — click any card to jump directly to those records.
          </p>
        </motion.div>

        {/* Summary Dashboard Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Active Listings Chart */}
          <div className="rounded-2xl p-6" style={{ background: '#000', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5" style={{ color: '#10B981' }} />
              <h3 className="font-bold text-white">Active Listings by Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { status: 'Not Contacted', count: 142 },
                { status: 'In Progress', count: 87 },
                { status: 'Interested', count: 54 },
                { status: 'Converted', count: 23 }
              ]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="status" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incoming Referrals Chart */}
          <div className="rounded-2xl p-6" style={{ background: '#000', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: '#EF4444' }} />
              <h3 className="font-bold text-white">Incoming Referrals Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { week: 'W1', referrals: 12 },
                { week: 'W2', referrals: 18 },
                { week: 'W3', referrals: 15 },
                { week: 'W4', referrals: 28 },
                { week: 'W5', referrals: 32 },
                { week: 'W6', referrals: 27 }
              ]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="referrals" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Interactive Stats */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
         >
          <LiveStatCard
            label="Active Clients"
            icon={UserCheck}
            path="/admin/clients"
            accentColor="#8B5CF6"
            query={() => appClient.entities.RelocationClient.list('-created_date', 200)}
            filter={c => !['closed', 'inactive', 'moved'].includes(c.status)}
          />
          <LiveStatCard
            label="Listing Owners"
            icon={Home}
            path="/admin/owners"
            accentColor="#10B981"
            query={async () => {
              const owners = await appClient.entities.ListingOwner.list('-created_date', 200);
              return owners.map(o => ({ ...o, _preview: o.owner_name || o.property_address, _badge: o.contact_status?.replace('_', ' ') }));
            }}
          />
          <LiveStatCard
            label="Active Campaigns"
            icon={SendHorizontal}
            path="/admin/scheduled-campaigns"
            accentColor="#F97316"
            query={async () => {
              const campaigns = await appClient.entities.ScheduledCampaign.list('-scheduled_for', 100);
              return campaigns
                .filter(c => c.status === 'scheduled' || c.status === 'sending')
                .map(c => ({ ...c, _preview: c.city, _badge: c.status }));
            }}
          />
          <LiveStatCard
            label="Pending Referrals"
            icon={LinkIcon}
            path="/admin/referrals"
            accentColor="#EF4444"
            query={async () => {
              const refs = await appClient.entities.AgentReferral.list('-created_date', 100);
              return refs
                .filter(r => r.referral_status === 'proposal_sent' || r.referral_status === 'agreed' || r.referral_status === 'in_process')
                .map(r => ({ ...r, _preview: r.list_agent_name, _badge: r.referral_status?.replace('_', ' ') }));
            }}
          />
        </motion.div>

        {/* Admin Sections */}
        {adminSections.map((section, sectionIdx) => (
          <motion.div
            key={section.heading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + sectionIdx * 0.05 }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6" style={{ background: GOLD }} />
              <p className="text-xs font-bold tracking-[0.3em]" style={{ color: GOLD }}>{section.heading}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.path}
                    to={module.path}
                    className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
                    style={{ background: '#000', border: '1px solid rgba(212,175,55,0.2)' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${module.color}22`, border: `1px solid ${module.color}44` }}>
                        <Icon className="w-6 h-6" style={{ color: module.color }} />
                      </div>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: GOLD }} />
                    </div>
                    <h3 className="font-bold mb-1" style={{ color: '#fff' }}>{module.name}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{module.description}</p>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Charlie Command Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 rounded-2xl p-6"
          style={{ background: '#000', border: `1px solid #A78BFA44` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#A78BFA22', border: '1px solid #A78BFA44' }}>
              <Brain className="w-5 h-5" style={{ color: '#A78BFA' }} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.3em]" style={{ color: '#A78BFA' }}>CHARLIE'S BRAIN</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Build, train & monitor your AI advisor</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Scripts", sub: "What Charlie says", path: '/admin/charlie-scripts', icon: ScrollText, color: '#F97316' },
              { label: "Knowledge Base", sub: "What Charlie knows", path: '/admin/charlie-knowledge-base', icon: Brain, color: '#A78BFA' },
              { label: "Escalations", sub: "What Charlie missed", path: '/admin/charlie-escalations', icon: AlertTriangle, color: '#EF4444' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}
                  className="group rounded-xl p-4 transition-all hover:scale-[1.02]"
                  style={{ background: '#0d0d0d', border: `1px solid ${item.color}33` }}>
                  <Icon className="w-5 h-5 mb-2" style={{ color: item.color }} />
                  <p className="font-bold text-sm" style={{ color: '#fff' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sub}</p>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl p-6"
          style={{ background: '#000', border: `1px solid ${GOLD}` }}
        >
          <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>QUICK ACTIONS</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/outreach-campaigns" className="px-4 py-2 rounded-full text-sm font-semibold transition-all" style={{ background: GOLD, color: '#000' }}>
              + New Campaign
            </Link>
            <Link to="/admin/clients" className="px-4 py-2 rounded-full text-sm font-semibold transition-all" style={{ background: 'rgba(212,175,55,0.2)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}>
              View All Clients
            </Link>
            <Link to="/admin/charlie-scripts" className="px-4 py-2 rounded-full text-sm font-semibold transition-all" style={{ background: 'rgba(212,175,55,0.2)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}>
              Edit Charlie Scripts
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}