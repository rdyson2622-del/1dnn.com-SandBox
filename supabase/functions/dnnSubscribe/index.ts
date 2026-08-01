import {
  adminClient,
  corsHeaders,
  createRecord,
  isOptions,
  json,
  listRecords,
  safeError,
  updateRecord,
} from '../_shared/dnn.ts';

type Subscriber = {
  email: string;
  full_name?: string;
  phone?: string | null;
  source?: string;
  partner_agent_id?: string | null;
  partner_agent_name?: string | null;
  last_engaged?: string;
  subscribed_at?: string;
  is_hot_lead?: boolean;
  unsubscribed?: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, maxLength: number) => String(value || '').trim().slice(0, maxLength);

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    // Bots often fill hidden fields. Return a normal-looking success without storing anything.
    if (body?.website) return json({ success: true, action: 'subscribed' });

    const email = clean(body?.email, 254).toLowerCase();
    if (!emailPattern.test(email)) return json({ error: 'A valid email address is required' }, 400);

    const client = adminClient();
    const subscribers = await listRecords<Subscriber>(client, 'DnnSubscriber', 5000);
    const existing = subscribers.find((subscriber) => subscriber.email?.toLowerCase() === email);
    const now = new Date().toISOString();
    if (existing) {
      if (existing.unsubscribed) {
        await updateRecord<Subscriber>(client, 'DnnSubscriber', existing.id, {
          unsubscribed: false,
          last_engaged: now,
          source: clean(body?.source, 120) || existing.source || 'direct',
        });
        return json({ success: true, action: 'resubscribed' });
      }
      return json({ success: true, action: 'already_subscribed' });
    }

    await createRecord(client, 'DnnSubscriber', {
      email,
      full_name: clean(body?.full_name, 160),
      phone: clean(body?.phone, 40) || null,
      tier: 'tier1',
      source: clean(body?.source, 120) || 'direct',
      partner_agent_id: clean(body?.partner_agent_id, 120) || null,
      partner_agent_name: clean(body?.partner_agent_name, 160) || null,
      subscribed_at: now,
      last_engaged: now,
      is_hot_lead: false,
      unsubscribed: false,
    });

    return json({ success: true, action: 'subscribed' });
  } catch (error) {
    return json({ error: safeError(error) }, 500);
  }
});
