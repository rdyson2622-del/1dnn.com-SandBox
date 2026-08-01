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
} from '../_shared/dnn.ts';

type Market = { city: string; state: string; dateline: string };
type ExistingArticle = { dateline?: string; generated_date?: string };
type GeneratedArticle = {
  headline: string;
  body: string;
  client_solution?: string;
  agent_solution?: string;
  vendor_solution?: string;
  tags?: string[];
  qa?: Array<{ question: string; answer: string }>;
};

const markets: Market[] = [
  { city: 'Austin', state: 'TX', dateline: 'AUSTIN —' },
  { city: 'Nashville', state: 'TN', dateline: 'NASHVILLE —' },
  { city: 'Phoenix', state: 'AZ', dateline: 'PHOENIX —' },
  { city: 'Denver', state: 'CO', dateline: 'DENVER —' },
  { city: 'Tampa', state: 'FL', dateline: 'TAMPA —' },
  { city: 'Charlotte', state: 'NC', dateline: 'CHARLOTTE —' },
  { city: 'Dallas', state: 'TX', dateline: 'DALLAS —' },
  { city: 'Boise', state: 'ID', dateline: 'BOISE —' },
  { city: 'Raleigh', state: 'NC', dateline: 'RALEIGH —' },
  { city: 'San Francisco', state: 'CA', dateline: 'SAN FRANCISCO —' },
  { city: 'Los Angeles', state: 'CA', dateline: 'LOS ANGELES —' },
  { city: 'Chicago', state: 'IL', dateline: 'CHICAGO —' },
  { city: 'Seattle', state: 'WA', dateline: 'SEATTLE —' },
  { city: 'Miami', state: 'FL', dateline: 'MIAMI —' },
  { city: 'Atlanta', state: 'GA', dateline: 'ATLANTA —' },
  { city: 'San Diego', state: 'CA', dateline: 'SAN DIEGO —' },
];

const topics = [
  ['tax_policy', 'state and local tax policy changes affecting homeowners and relocating families'],
  ['housing_market', 'current housing inventory, sales pace, prices, and buyer competition'],
  ['job_market', 'major employer moves, remote work, and job shifts driving relocation'],
  ['interest_rates', 'mortgage rate movement and its effect on local home buying'],
  ['migration_data', 'interstate migration, population flows, and demographic shifts'],
  ['employer_news', 'corporate relocations, office expansions, and employer moves affecting housing demand'],
] as const;

const promptFor = (market: Market, topic: string) => `You are the DNN Intelligence Bureau, the editorial voice of Dyson & Dyson Real Estate Concierge.

Use Google Search to verify the newest reliable facts available today for ${market.city}, ${market.state}. Never invent a statistic or date. Prefer primary government and official data; attribute any trade or private research in the body.

TOPIC: ${topic}

Write in an authoritative, data-grounded, sophisticated voice. Return valid JSON only:
{
  "headline": "factual ${market.city} headline under 12 words",
  "body": "three paragraphs, 200-280 words: current news, relocation impact, then the Dyson solution",
  "client_solution": "one or two respectful sentences",
  "agent_solution": "one or two respectful sentences",
  "vendor_solution": "one or two respectful sentences",
  "tags": ["three", "to", "five", "lowercase", "tags"],
  "qa": [
    {"question": "Charlie's natural question", "answer": "Bob's conversational answer under 65 words"},
    {"question": "Charlie's reactive follow-up", "answer": "Bob's conversational answer under 65 words"},
    {"question": "Charlie's final question", "answer": "Bob's actionable answer under 65 words"}
  ]
}

Charlie is sharp and curious. Bob is warm and seasoned, offers suggestions instead of directives, and never begins with “That's a great question” or “Absolutely.”`;

Deno.serve(async (req) => {
  if (isOptions(req)) return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const client = adminClient();
    await authorizeAdminOrCron(req, client);
    const requestBody = await req.json().catch(() => ({}));
    const requestedCount = Number(requestBody?.count || Deno.env.get('DNN_LOCAL_ARTICLE_COUNT') || 10);
    const count = Math.max(1, Math.min(10, requestedCount));
    const offset = dayOfYear() % markets.length;
    const selected = Array.from({ length: count }, (_, index) => markets[(offset + index) % markets.length]);
    const existing = await listRecords<ExistingArticle>(client, 'DnnArticle', 500);
    const force = requestBody?.force === true;

    const results = [];
    const errors = [];
    for (let index = 0; index < selected.length; index += 1) {
      const market = selected[index];
      if (!force && existing.some((article) => article.dateline === market.dateline && startedToday(article.generated_date))) {
        results.push({ market: market.city, status: 'already_published_today' });
        continue;
      }

      const [triggerType, topic] = topics[(offset + index) % topics.length];
      try {
        const generated = await generateGroundedJson<GeneratedArticle>(promptFor(market, topic));
        if (!generated.headline || !generated.body) throw new Error('Generated article is missing a headline or body');
        const now = new Date().toISOString();
        await createRecord(client, 'DnnArticle', {
          headline: generated.headline,
          dateline: market.dateline,
          body: generated.body,
          client_solution: generated.client_solution || '',
          agent_solution: generated.agent_solution || '',
          vendor_solution: generated.vendor_solution || '',
          tags: Array.from(new Set([market.city.toLowerCase(), ...(generated.tags || [])])),
          trigger_type: triggerType,
          scope: 'local',
          audience: 'all',
          interview_qa: generated.qa || [],
          status: 'published',
          production_status: 'none',
          generated_date: now,
          published_date: now,
        });
        results.push({ market: market.city, trigger_type: triggerType, headline: generated.headline, status: 'published' });
      } catch (error) {
        errors.push({ market: market.city, error: safeError(error) });
      }
    }

    return json({
      success: errors.length === 0,
      requested: selected.length,
      published: results.filter((item) => item.status === 'published').length,
      articles: results,
      errors,
    });
  } catch (error) {
    const message = safeError(error);
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return json({ error: message }, status);
  }
});
