import {
  adminClient,
  corsHeaders,
  createRecord,
  isOptions,
  json,
  safeError,
} from '../_shared/dnn.ts';

const BOB_EMAIL = 'rdyson2622@gmail.com';
const clean = (value: unknown, maxLength: number) => String(value || '').trim().slice(0, maxLength);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendNotification = async (subject: string, text: string, replyTo: string) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('DNN_FROM_EMAIL') || 'DNN Website <onboarding@resend.dev>',
      to: [BOB_EMAIL],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected the notification (${response.status})`);
  return true;
};

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const source = body?.form || {};
    const form = {
      full_name: clean(source.full_name, 160),
      email: clean(source.email, 254).toLowerCase(),
      phone: clean(source.phone, 40),
      current_city: clean(source.current_city, 160),
      destination_city: clean(source.destination_city, 160),
      move_date: clean(source.move_date, 80),
      budget: clean(source.budget, 80),
      family_size: clean(source.family_size, 20),
      priorities: Array.isArray(source.priorities) ? source.priorities.map((item: unknown) => clean(item, 80)).slice(0, 20) : [],
      notes: clean(source.notes, 4000),
      agent_preferences: clean(source.agent_preferences, 4000),
      property_preferences: clean(source.property_preferences, 4000),
      neighborhood_notes: clean(source.neighborhood_notes, 4000),
      due_diligence_notes: clean(source.due_diligence_notes, 4000),
    };
    if (!form.full_name || !emailPattern.test(form.email) || !form.destination_city) {
      return json({ error: 'Name, a valid email, and destination city are required' }, 400);
    }

    const client = adminClient();
    const now = new Date().toISOString();
    await createRecord(client, 'RelocationClient', {
      ...form,
      move_date: form.move_date === 'asap' ? '' : form.move_date,
      family_size: form.family_size ? Number.parseInt(form.family_size, 10) || undefined : undefined,
      priorities: form.priorities.map((item: string) => item.toLowerCase().replace(/\s+/g, '_')),
      status: 'in_consultation',
      agreement_accepted_at: body?.sign_timing === 'now' ? now : null,
      sign_timing: clean(body?.sign_timing, 30) || 'now',
    });
    await createRecord(client, 'OptIn', {
      email: form.email,
      phone: form.phone || null,
      full_name: form.full_name,
      source: 'relocation_intake',
      opted_in_at: now,
      initial_data: {
        destination_city: form.destination_city,
        move_date: form.move_date,
        budget: form.budget,
        priorities: form.priorities,
        family_size: form.family_size,
      },
      status: 'new',
    });

    const call = body?.scheduled_call;
    const callText = call?.day?.label && call?.time
      ? `${clean(call.day.label, 80)} at ${clean(call.time, 30)} Pacific`
      : 'Not scheduled';
    const notificationSent = await sendNotification(
      `New Relocation Intake: ${form.full_name} → ${form.destination_city}`,
      [
        'A relocation client submitted their intake and service-agreement choice.', '',
        `Name: ${form.full_name}`, `Email: ${form.email}`, `Phone: ${form.phone || 'Not provided'}`,
        `From: ${form.current_city || 'Not provided'}`, `To: ${form.destination_city}`,
        `Timeline: ${form.move_date || 'Not provided'}`, `Budget: ${form.budget || 'Not provided'}`,
        `Family size: ${form.family_size || 'Not provided'}`, `Priorities: ${form.priorities.join(', ') || 'Not provided'}`,
        `Intro call: ${callText}`, `Agreement choice: ${clean(body?.sign_timing, 30) || 'now'}`, '',
        `Notes: ${form.notes || 'None'}`,
      ].join('\n'),
      form.email,
    );

    return json({ success: true, notification_sent: notificationSent, recipient: BOB_EMAIL });
  } catch (error) {
    return json({ error: safeError(error) }, 500);
  }
});
