import React from 'react';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#D4AF37';

export default function CampaignScheduleCalendar({ campaignId }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['posts', campaignId],
    queryFn: () => appClient.entities.SocialPost.filter({ campaign_id: campaignId }, '-scheduled_date', 100),
  });

  const scheduledPosts = posts.filter(p => p.scheduled_date && p.status === 'scheduled');

  // Group by month
  const postsByMonth = {};
  scheduledPosts.forEach(post => {
    const month = post.scheduled_date?.substring(0, 7);
    if (month) {
      if (!postsByMonth[month]) postsByMonth[month] = [];
      postsByMonth[month].push(post);
    }
  });

  const months = Object.keys(postsByMonth).sort();

  return (
    <div className="rounded-xl p-6" style={{ background: '#2a2a2a', border: `1px solid #444` }}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" style={{ color: GOLD }} />
        <h3 className="text-lg font-bold" style={{ color: '#fff' }}>Schedule Calendar</h3>
      </div>

      {months.length === 0 ? (
        <p style={{ color: '#888' }}>No scheduled posts yet</p>
      ) : (
        <div className="space-y-4">
          {months.map(month => (
            <div key={month}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#aaa' }}>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {postsByMonth[month].map(post => (
                  <div
                    key={post.id}
                    className="rounded-lg p-3 text-sm"
                    style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33` }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span style={{ color: GOLD, fontWeight: 600 }}>
                        {new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#333', color: '#aaa' }}>
                        {post.platform}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: '#ddd' }}>
                      {post.selected_copy || 'Copy pending...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button className="w-full mt-4 gap-2" style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}` }}>
        <Plus className="w-4 h-4" /> Add Post to Calendar
      </Button>
    </div>
  );
}