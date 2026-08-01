import {
  adminClient,
  authorizeAdminOrCron,
  corsHeaders,
  isOptions,
  json,
  safeError,
} from '../_shared/dnn.ts';

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const client = adminClient();
    await authorizeAdminOrCron(req, client);
    const retentionDays = Math.max(1, Number(Deno.env.get('DNN_ARTICLE_RETENTION_DAYS') || 2));
    const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();

    const { data: candidates, error: readError } = await client
      .from('app_records')
      .select('id, data, created_at')
      .eq('entity', 'DnnArticle')
      .lt('created_at', cutoff)
      .limit(1000);
    if (readError) throw readError;

    const ids = (candidates || [])
      .filter((row) => !Array.isArray(row.data?.tags) || !row.data.tags.includes('featured'))
      .map((row) => row.id);

    if (ids.length) {
      const { error: deleteError } = await client
        .from('app_records')
        .delete()
        .eq('entity', 'DnnArticle')
        .in('id', ids);
      if (deleteError) throw deleteError;
    }

    return json({ success: true, deleted: ids.length, retention_days: retentionDays, cutoff });
  } catch (error) {
    const message = safeError(error);
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return json({ error: message }, status);
  }
});
