import {
  corsHeaders,
  generateGroundedJson,
  isOptions,
  json,
  safeError,
} from '../_shared/dnn.ts';

const MAX_PROMPT_LENGTH = 20_000;

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) return json({ error: 'A prompt is required' }, 400);
    if (prompt.length > MAX_PROMPT_LENGTH) return json({ error: 'Prompt is too long' }, 413);

    const result = await generateGroundedJson<Record<string, unknown>>(prompt);
    return json(result);
  } catch (error) {
    const message = safeError(error);
    const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
    return json({ error: message }, status);
  }
});
