# 1DNN Sandbox

This is the review copy of 1DNN.com. Bob can request changes here, and Jay can verify them before anything is moved to the live website.

## What works now

- The React site builds without the previous platform SDK or build plugin.
- Formerly hosted images and videos are stored inside this repository.
- Without cloud settings, the site opens in local sandbox mode and saves test records only in the current browser.
- Local review mode includes a starter DNN news feed and the uploaded 4K studio broadcast.
- With Supabase configured, login, records, real-time updates, and file uploads use Supabase's free tier.
- The national-source desk, local-market desk, two-day cleanup, and subscription endpoint have Supabase Edge Function replacements.

## Run it locally

```bash
npm install
npm run dev
```

## Connect the free Supabase backend

1. Create a free project at <https://supabase.com>.
2. Open the project's SQL editor and run `supabase/migrations/001_initial.sql`, then `supabase/migrations/002_dnn_news_and_security.sql`.
3. Copy `.env.example` to `.env.local` and add the project URL and public anon key.
4. In Supabase Authentication settings, add the local and deployed `/login` URLs as allowed redirect URLs.
5. Have Bob and Jay sign in once, then use the final commented SQL statement in the first migration to make only their profiles administrators. Disable new-user signups after both accounts exist.

## Turn on the automatic DNN newsroom

1. Deploy `dnnNationalSourcePull`, `dnnDailyArticle`, `dnnArticleCleanup`, and `dnnSubscribe` from `supabase/functions`.
2. In Supabase Edge Function secrets, add `GEMINI_API_KEY` and a long random `DNN_CRON_SECRET`. `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`.
3. Copy `supabase/setup-dnn-cron.sql.example`, replace its three placeholders, and run the edited copy in the Supabase SQL editor.
4. Confirm the three jobs in Supabase Cron. National briefs run at 6 AM Pacific, local-market briefs at 7 AM Pacific, and cleanup at 3 AM Pacific.

The scheduler is deliberately not installed automatically because its project URL, publishable key, and private cron secret must never be committed. Generated articles are published into `DnnArticle`, the same entity read by the DNN News tab.

Never place a Supabase service-role key, Twilio secret, Gemini key, HeyGen key, or other private credential in this repository. Server-only integrations belong in Supabase Edge Function secrets.

## Remaining backend integrations

The browser-facing database and login layer and the core DNN article workflow have been replaced. Other buttons that call email, SMS, HeyGen/Creatomate rendering, skip-trace, or campaign jobs still target Supabase Edge Functions with their original job names. Those external-service functions must be migrated and supplied with their vendor credentials before those specific admin tools can operate independently.
