import {
  adminClient,
  corsHeaders,
  createRecord,
  isOptions,
  json,
  safeError,
} from '../_shared/dnn.ts';

const BOB_EMAIL = 'rdyson2622@gmail.com';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, maxLength: number) => String(value || '').trim().slice(0, maxLength);

const sendBookingEmail = async (booking: Record<string, string>) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return false;

  const from = Deno.env.get('DNN_FROM_EMAIL') || 'DNN Website <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [BOB_EMAIL],
      reply_to: booking.email,
      subject: `New Bob Dyson call: ${booking.full_name} — ${booking.day} at ${booking.time} PT`,
      text: [
        'A visitor booked a 15-minute call with Bob Dyson.',
        '',
        `Name: ${booking.full_name}`,
        `Email: ${booking.email}`,
        `Phone: ${booking.phone}`,
        `Day: ${booking.day}`,
        `Time: ${booking.time} Pacific`,
        `Destination: ${booking.destination_city || 'Not provided'}`,
        `Source: ${booking.source}`,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Email provider rejected the notification (${response.status}): ${payload.slice(0, 300)}`);
  }
  return true;
};

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.website) return json({ success: true, notification_sent: true });

    const booking = {
      full_name: clean(body?.full_name, 160),
      email: clean(body?.email, 254).toLowerCase(),
      phone: clean(body?.phone, 40),
      day: clean(body?.day?.label || body?.day, 80),
      date: clean(body?.day?.value, 20),
      time: clean(body?.time, 30),
      destination_city: clean(body?.destination_city, 160),
      source: clean(body?.source, 80) || 'website',
    };

    if (!booking.full_name || !emailPattern.test(booking.email) || !booking.phone || !booking.day || !booking.time) {
      return json({ error: 'Name, a valid email, phone, day, and time are required' }, 400);
    }

    await createRecord(adminClient(), 'IntroCallBooking', {
      ...booking,
      recipient: BOB_EMAIL,
      status: 'scheduled',
      booked_at: new Date().toISOString(),
    });

    const notificationSent = await sendBookingEmail(booking);
    return json({
      success: true,
      notification_sent: notificationSent,
      recipient: BOB_EMAIL,
    });
  } catch (error) {
    return json({ error: safeError(error) }, 500);
  }
});
