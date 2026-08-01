import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Eye, Handshake, Users, Sparkles, Copy, Mail, MessageCircle, Eye as EyeIcon
} from 'lucide-react';
import { toast } from 'sonner';

const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

const benefits = [
  {
    icon: Sparkles,
    title: "Zero Cost to You",
    desc: "Present this to your sellers at no expense. It's your competitive advantage when listing."
  },
  {
    icon: DollarSign,
    title: "25% Referral Fee",
    desc: "At close of escrow, you earn 25% of the home sale price. We handle 100% of the relocation."
  },
  {
    icon: TrendingUp,
    title: "Higher Close Rate",
    desc: "Our partnerships with top receiving brokers in every market means faster sales, better terms, fewer contingencies."
  },
  {
    icon: Eye,
    title: "Blind Transaction Access",
    desc: "Follow the relocation journey with your client—milestone updates, moving progress, timeline visibility. Stay in the loop."
  },
  {
    icon: Handshake,
    title: "Keep Your Relationship",
    desc: "We manage the move logistics. You stay the trusted advisor. Clients see you partnered with world-class relocation management."
  },
  {
    icon: Users,
    title: "Top Broker Network",
    desc: "We work with the 10 best agents/brokers in each destination. Your seller gets expert placement, not random network."
  },
];

export default function AdminListingAgentExplainer() {
  const presentationUrl = `${window.location.origin}/AgentExplainer`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(presentationUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Listing Agent Explainer</h1>
            <p className="text-muted-foreground">Send the agent presentation directly from admin. Track responses & link clicks.</p>
          </div>
          <Link to="/Admin">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-slate-50">
              Back to Admin
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Link Control */}
          <div className="col-span-2 border rounded-lg p-6 bg-card">
            <h2 className="font-bold text-lg mb-4">Presentation Link</h2>
            <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200 mb-4">
              <span className="text-xs font-mono flex-1 truncate text-slate-700">{presentationUrl}</span>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Copy link"
              >
                <Copy className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <Mail className="w-4 h-4" />
                Send Email to Agent
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                <MessageCircle className="w-4 h-4" />
                Send SMS to Agent
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors">
                <EyeIcon className="w-4 h-4" />
                Preview Live
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Bulk Send:</strong> Upload a CSV of agent emails/phones to send the presentation + tracking link to multiple agents at once.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="font-bold text-lg mb-4">Tracking</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opens</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Linked to Client</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="font-bold text-lg mb-4">Recent Sends</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No agents have been sent this presentation yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}