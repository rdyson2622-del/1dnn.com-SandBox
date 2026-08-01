import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-dnn-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export type AppRecord<T = Record<string, unknown>> = T & {
  id: string;
  created_date: string;
  updated_date: string;
};

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

export const isOptions = (req: Request) => req.method === 'OPTIONS';

const getSecretKey = () => {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;

  const configured = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (!configured) throw new Error('Supabase secret key is unavailable');
  const parsed = JSON.parse(configured);
  const key = parsed.default || Object.values(parsed)[0];
  if (typeof key !== 'string' || !key) throw new Error('Supabase secret key is unavailable');
  return key;
};

export const adminClient = (): SupabaseClient => {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('SUPABASE_URL is unavailable');
  return createClient(url, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const authorizeAdminOrCron = async (req: Request, client: SupabaseClient) => {
  const suppliedCronSecret = req.headers.get('x-dnn-cron-secret');
  const expectedCronSecret = Deno.env.get('DNN_CRON_SECRET');
  if (expectedCronSecret && suppliedCronSecret === expectedCronSecret) return { type: 'cron' as const };

  const authorization = req.headers.get('authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new Error('Unauthorized');

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) throw new Error('Unauthorized');
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'admin') throw new Error('Forbidden');
  return { type: 'admin' as const, user: userData.user };
};

export const listRecords = async <T>(
  client: SupabaseClient,
  entity: string,
  limit = 500,
): Promise<AppRecord<T>[]> => {
  const { data, error } = await client
    .from('app_records')
    .select('id, data, created_at, updated_at')
    .eq('entity', entity)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) => ({
    ...(row.data as T),
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
  }));
};

export const createRecord = async <T>(client: SupabaseClient, entity: string, data: T) => {
  const { data: row, error } = await client
    .from('app_records')
    .insert({ entity, data })
    .select('id, data, created_at, updated_at')
    .single();
  if (error) throw error;
  return {
    ...(row.data as T),
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
};

export const updateRecord = async <T extends object>(
  client: SupabaseClient,
  entity: string,
  id: string,
  updates: Partial<T>,
) => {
  const { data: current, error: readError } = await client
    .from('app_records')
    .select('data')
    .eq('entity', entity)
    .eq('id', id)
    .single();
  if (readError) throw readError;

  const { error } = await client
    .from('app_records')
    .update({ data: { ...(current.data || {}), ...updates } })
    .eq('entity', entity)
    .eq('id', id);
  if (error) throw error;
};

const stripJsonFence = (text: string) => text
  .trim()
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```$/, '');

export const generateGroundedJson = async <T>(prompt: string): Promise<T> => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini request failed (${response.status})`);
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('Gemini returned an empty response');

  try {
    return JSON.parse(stripJsonFence(text)) as T;
  } catch {
    throw new Error('Gemini returned invalid JSON');
  }
};

export const dayOfYear = (date = new Date()) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
};

export const startedToday = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getUTCFullYear() === today.getUTCFullYear()
    && date.getUTCMonth() === today.getUTCMonth()
    && date.getUTCDate() === today.getUTCDate();
};

export const safeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
