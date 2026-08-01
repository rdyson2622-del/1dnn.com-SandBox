import {
  adminClient,
  authorizeAdminOrCron,
  corsHeaders,
  createRecord,
  dayOfYear,
  generateGroundedJson,
  isOptions,
  json,
  listRecords,
  safeError,
  startedToday,
  updateRecord,
} from '../_shared/dnn.ts';

type NewsSource = {
  source_name: string;
  category: string;
  source_url?: string;
  what_it_provides?: string;
  audience?: string;
  is_active?: boolean;
  display_order?: number;
  last_pulled_at?: string | null;
};

type GeneratedArticle = {
  headline: string;
  dateline?: string;
  body: string;
  client_solution?: string;
  agent_solution?: string;
  vendor_solution?: string;
  tags?: string[];
  qa?: Array<{ question: string; answer: string }>;
};

const categoryMap: Record<string, string> = {
  federal_reserve: 'federal_reserve',
  mortgage_lending: 'mortgage_lending',
  federal_legislation: 'federal_legislation',
  national_housing_data: 'national_housing_data',
  economic_indicators: 'economic_indicators',
  demographics_migration: 'demographics_migration',
  insurance_climate: 'insurance_climate',
  regulatory_compliance: 'regulatory_compliance',
  construction_supply: 'construction_supply',
  consumer_protection: 'consumer_protection',
  industry_trade: 'general',
};

const promptFor = (source: NewsSource) => `You are the DNN Intelligence Bureau, the national desk of Dyson & Dyson Real Estate Concierge.

Use Google Search to verify the newest factual development available from this source as of today. Never invent a number or date. If the source has no meaningful new release, use its most recent confirmed release and state the release date in the body.

SOURCE: ${source.source_name}
CATEGORY: ${source.category}
SOURCE URL: ${source.source_url || 'not supplied'}
WHAT IT PROVIDES: ${source.what_it_provides || ''}

Write in an authoritative, data-grounded, sophisticated voice with no hype and no external links in the article body. Use the News → Impact → Dyson Solution structure.

Return valid JSON only with exactly these fields:
{
  "headline": "factual national headline under 12 words",
  "dateline": "WASHINGTON — or NATIONAL REPORT — or WEEKLY DATA —",
  "body": "three paragraphs, 200-280 words: news, impact on housing/mortgage/relocation, then the Dyson solution",
  "client_solution": "one or two sentences",
  "agent_solution": "one or two sentences",
  "vendor_solution": "one or two sentences",
  "tags": ["three", "to", "five", "lowercase", "tags"],
  "qa": [
    {"question": "Charlie's natural anchor question", "answer": "Bob's direct conversational answer under 65 words"},
    {"question": "Charlie's follow-up", "answer": "Bob's direct conversational answer under 65 words"},
    {"question": "Charlie's final question", "answer": "Bob's actionable answer under 65 words"}
  ]
}

Bob never begins with “That's a great question” or “Absolutely.” Charlie probes instead of reading the article aloud.`;

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const client = adminClient();
    await authorizeAdminOrCron(req, client);
    const requestBody = await req.json().catch(() => ({}));
    const requestedCount = Number(requestBody?.count || Deno.env.get('DNN_NATIONAL_ARTICLE_COUNT') || 5);
    const count = Math.max(1, Math.min(5, requestedCount));

    const sources = (await listRecords<NewsSource>(client, 'DnnNewsSource', 100))
      .filter((source) => source.is_active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    if (!sources.length) return json({ error: 'No active DNN news sources are configured' }, 404);

    const start = dayOfYear() % sources.length;
    const selected = Array.from(
      { length: Math.min(count, sources.length) },
      (_, index) => sources[(start + index) % sources.length],
    );
    const force = requestBody?.force === true;
    const articles = [];
    const errors = [];

    for (const source of selected) {
      if (!force && startedToday(source.last_pulled_at)) {
        articles.push({ source: source.source_name, status: 'already_pulled_today' });
        continue;
      }

      try {
        const generated = await generateGroundedJson<GeneratedArticle>(promptFor(source));
        if (!generated.headline || !generated.body) throw new Error('Generated article is missing a headline or body');
        const now = new Date().toISOString();
        const tags = Array.from(new Set(['national', ...(generated.tags || [])]));

        await createRecord(client, 'DnnArticle', {
          headline: generated.headline,
          dateline: generated.dateline || 'NATIONAL REPORT —',
          body: generated.body,
          client_solution: generated.client_solution || '',
          agent_solution: generated.agent_solution || '',
          vendor_solution: generated.vendor_solution || '',
          tags,
          trigger_type: categoryMap[source.category] || 'general',
          scope: 'national',
          audience: source.audience || 'all',
          interview_qa: generated.qa || [],
          source_name: source.source_name,
          source_url: source.source_url || '',
          status: 'published',
          production_status: 'none',
          generated_date: now,
          published_date: now,
        });
        await updateRecord<NewsSource>(client, 'DnnNewsSource', source.id, { last_pulled_at: now });
        articles.push({ source: source.source_name, headline: generated.headline, status: 'published' });
      } catch (error) {
        errors.push({ source: source.source_name, error: safeError(error) });
      }
    }

    return json({
      success: errors.length === 0,
      sources_total: sources.length,
      sources_selected: selected.length,
      published: articles.filter((item) => item.status === 'published').length,
      articles,
      errors,
    });
  } catch (error) {
    const message = safeError(error);
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return json({ error: message }, status);
  }
});
