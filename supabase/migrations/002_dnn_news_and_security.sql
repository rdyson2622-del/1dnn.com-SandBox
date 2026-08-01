-- Tighten the generic record store before it holds real client or subscriber data.
-- Public visitors may read published DNN articles. Only approved administrators
-- may read or modify any other application records.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "signed-in users read records" on public.app_records;
drop policy if exists "signed-in users create records" on public.app_records;
drop policy if exists "signed-in users update records" on public.app_records;
drop policy if exists "signed-in users delete records" on public.app_records;

create policy "public reads published DNN articles" on public.app_records
for select to anon, authenticated
using (
  entity = 'DnnArticle'
  and data->>'status' in ('published', 'blasted')
);

create policy "admins manage all records" on public.app_records
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins read profiles" on public.profiles
for select to authenticated
using (public.is_admin());

drop policy if exists "signed-in users upload assets" on storage.objects;
drop policy if exists "signed-in users update assets" on storage.objects;
drop policy if exists "signed-in users delete assets" on storage.objects;

create policy "admins upload assets" on storage.objects
for insert to authenticated
with check (bucket_id = 'public-assets' and public.is_admin());

create policy "admins update assets" on storage.objects
for update to authenticated
using (bucket_id = 'public-assets' and public.is_admin())
with check (bucket_id = 'public-assets' and public.is_admin());

create policy "admins delete assets" on storage.objects
for delete to authenticated
using (bucket_id = 'public-assets' and public.is_admin());

-- Seed the editorial source desk. Existing records are never overwritten.
with source_rows(data) as (
  values
    (jsonb_build_object('source_name','Freddie Mac PMMS','category','mortgage_lending','source_url','https://www.freddiemac.com/pmms','source_type','government','license_type','public_domain','cadence','weekly','audience','all','what_it_provides','Weekly 30-year and 15-year fixed mortgage rate survey','is_active',true,'display_order',1)),
    (jsonb_build_object('source_name','FOMC Federal Reserve Statements','category','federal_reserve','source_url','https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm','source_type','government','license_type','public_domain','cadence','event_driven','audience','all','what_it_provides','Federal Reserve rate decisions and forward guidance','is_active',true,'display_order',2)),
    (jsonb_build_object('source_name','FRED Economic Data','category','economic_indicators','source_url','https://fred.stlouisfed.org','source_type','government','license_type','public_domain','cadence','daily','audience','all','what_it_provides','Macroeconomic indicators, Treasury yields, GDP, CPI, and historical charts','is_active',true,'display_order',3)),
    (jsonb_build_object('source_name','FHFA Conforming Loan Limits','category','mortgage_lending','source_url','https://www.fhfa.gov/data/conforming-loan-limit','source_type','government','license_type','public_domain','cadence','yearly','audience','all','what_it_provides','Annual conforming loan limits and home-price index data','is_active',true,'display_order',4)),
    (jsonb_build_object('source_name','MBA Weekly Applications Survey','category','mortgage_lending','source_url','https://www.mba.org/news-and-research','source_type','industry_data','license_type','attribution_required','cadence','weekly','audience','vendor','what_it_provides','Mortgage application, refinance, and purchase indexes','is_active',true,'display_order',5)),
    (jsonb_build_object('source_name','Congress.gov Housing Bills','category','federal_legislation','source_url','https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22search%22%3A%22housing%22%7D','source_type','government','license_type','public_domain','cadence','event_driven','audience','all','what_it_provides','Pending federal housing and tax legislation','is_active',true,'display_order',6)),
    (jsonb_build_object('source_name','HUD Rule Changes','category','federal_legislation','source_url','https://www.hud.gov/federalregister','source_type','government','license_type','public_domain','cadence','event_driven','audience','all','what_it_provides','Fair housing, FHA, and affordability policy changes','is_active',true,'display_order',7)),
    (jsonb_build_object('source_name','NAR Existing Home Sales','category','national_housing_data','source_url','https://www.nar.realtor/research-and-statistics','source_type','industry_data','license_type','attribution_required','cadence','monthly','audience','all','what_it_provides','Existing and pending home sales and affordability indexes','is_active',true,'display_order',8)),
    (jsonb_build_object('source_name','Census Bureau New Residential Construction','category','national_housing_data','source_url','https://www.census.gov/construction/nrc/','source_type','government','license_type','public_domain','cadence','monthly','audience','all','what_it_provides','Housing starts, building permits, and completions','is_active',true,'display_order',9)),
    (jsonb_build_object('source_name','S&P CoreLogic Case-Shiller Index','category','national_housing_data','source_url','https://www.spglobal.com/spdji/en/index-family/indicators/sp-corelogic-case-shiller/','source_type','industry_data','license_type','attribution_required','cadence','monthly','audience','all','what_it_provides','National and metro home-price indexes','is_active',true,'display_order',10)),
    (jsonb_build_object('source_name','Zillow Research','category','national_housing_data','source_url','https://www.zillow.com/research/','source_type','industry_data','license_type','attribution_required','cadence','weekly','audience','all','what_it_provides','Market forecasts, inventory, and home-value research','is_active',true,'display_order',11)),
    (jsonb_build_object('source_name','Redfin Data Center','category','national_housing_data','source_url','https://www.redfin.com/news/data-center/','source_type','industry_data','license_type','attribution_required','cadence','monthly','audience','all','what_it_provides','Market reports, sales velocity, and migration data','is_active',true,'display_order',12)),
    (jsonb_build_object('source_name','Realtor.com Research','category','national_housing_data','source_url','https://www.realtor.com/research/','source_type','industry_data','license_type','rewrite_only','cadence','weekly','audience','all','what_it_provides','Housing-market, buyer, seller, and relocation research','is_active',true,'display_order',13)),
    (jsonb_build_object('source_name','BLS Employment Report','category','economic_indicators','source_url','https://www.bls.gov/news.release/empsit.toc.htm','source_type','government','license_type','public_domain','cadence','monthly','audience','all','what_it_provides','Employment, unemployment, and sector-level jobs data','is_active',true,'display_order',14)),
    (jsonb_build_object('source_name','BLS Consumer Price Index','category','economic_indicators','source_url','https://www.bls.gov/cpi/','source_type','government','license_type','public_domain','cadence','monthly','audience','all','what_it_provides','Consumer inflation data affecting mortgage rates and purchasing power','is_active',true,'display_order',15)),
    (jsonb_build_object('source_name','United Van Lines Migration Study','category','demographics_migration','source_url','https://www.unitedvanlines.com/newsroom/movers-study','source_type','migration_demographics','license_type','attribution_required','cadence','yearly','audience','all','what_it_provides','Annual state inbound and outbound moving patterns','is_active',true,'display_order',16)),
    (jsonb_build_object('source_name','U-Haul Growth Index','category','demographics_migration','source_url','https://www.uhaul.com/Articles/About-U-Haul/U-Haul-Growth-Index/','source_type','migration_demographics','license_type','attribution_required','cadence','yearly','audience','all','what_it_provides','State and city one-way migration rankings','is_active',true,'display_order',17)),
    (jsonb_build_object('source_name','Census ACS Migration Data','category','demographics_migration','source_url','https://www.census.gov/programs-surveys/acs','source_type','government','license_type','public_domain','cadence','yearly','audience','all','what_it_provides','Population shifts, state-to-state flows, and demographic data','is_active',true,'display_order',18)),
    (jsonb_build_object('source_name','Pew Research Housing & Demographics','category','demographics_migration','source_url','https://www.pewresearch.org/topic/housing/','source_type','migration_demographics','license_type','attribution_required','cadence','monthly','audience','all','what_it_provides','Generational, household, remote-work, and homeownership trends','is_active',true,'display_order',19)),
    (jsonb_build_object('source_name','First Street Foundation Climate Risk','category','insurance_climate','source_url','https://firststreet.org','source_type','climate_risk','license_type','attribution_required','cadence','event_driven','audience','all','what_it_provides','Property-level flood, fire, and climate-risk research','is_active',true,'display_order',20)),
    (jsonb_build_object('source_name','FEMA Flood Maps','category','insurance_climate','source_url','https://www.fema.gov/flood-maps','source_type','government','license_type','public_domain','cadence','event_driven','audience','all','what_it_provides','Flood maps, disaster declarations, and NFIP updates','is_active',true,'display_order',21)),
    (jsonb_build_object('source_name','NAR Settlement & Policy Updates','category','regulatory_compliance','source_url','https://www.nar.realtor','source_type','industry_data','license_type','rewrite_only','cadence','event_driven','audience','agent','what_it_provides','Broker compensation, settlement, and industry policy updates','is_active',true,'display_order',22)),
    (jsonb_build_object('source_name','CFPB Mortgage Rules','category','regulatory_compliance','source_url','https://www.consumerfinance.gov/regulatory-resources/','source_type','government','license_type','public_domain','cadence','event_driven','audience','all','what_it_provides','Mortgage disclosure and consumer-protection rules','is_active',true,'display_order',23)),
    (jsonb_build_object('source_name','NAHB Lumber & Material Costs','category','construction_supply','source_url','https://www.nahb.org/news-and-economics/housing-economics/national-statistics/framing-lumber-prices','source_type','industry_data','license_type','attribution_required','cadence','weekly','audience','vendor','what_it_provides','Framing-lumber and residential construction-material costs','is_active',true,'display_order',24)),
    (jsonb_build_object('source_name','FBI IC3 Wire Fraud Alerts','category','consumer_protection','source_url','https://www.ic3.gov/PSA','source_type','government','license_type','public_domain','cadence','event_driven','audience','client','what_it_provides','Real-estate wire fraud and impersonation alerts','is_active',true,'display_order',25)),
    (jsonb_build_object('source_name','HousingWire','category','industry_trade','source_url','https://www.housingwire.com','source_type','news_aggregation','license_type','rewrite_only','cadence','daily','audience','all','what_it_provides','Housing, mortgage, and regulatory trade reporting','is_active',true,'display_order',26)),
    (jsonb_build_object('source_name','Inman News','category','industry_trade','source_url','https://www.inman.com','source_type','news_aggregation','license_type','rewrite_only','cadence','daily','audience','agent','what_it_provides','Agent-focused real-estate industry and technology reporting','is_active',true,'display_order',27)),
    (jsonb_build_object('source_name','National Mortgage News','category','mortgage_lending','source_url','https://www.nationalmortgagenews.com','source_type','news_aggregation','license_type','rewrite_only','cadence','daily','audience','vendor','what_it_provides','Mortgage-market, GSE-policy, and lending-industry reporting','is_active',true,'display_order',28))
)
insert into public.app_records(entity, data)
select 'DnnNewsSource', source_rows.data
from source_rows
where not exists (
  select 1 from public.app_records existing
  where existing.entity = 'DnnNewsSource'
    and existing.data->>'source_name' = source_rows.data->>'source_name'
);

-- Keep the uploaded studio broadcast visible from the first Supabase launch.
insert into public.app_records(entity, data)
select 'DnnArticle', jsonb_build_object(
  'headline', 'DNN Real Estate News — 4K Daily Broadcast',
  'dateline', 'DNN NEWS —',
  'body', 'Charlie Simmons and Bob Dyson deliver the DNN real estate news broadcast in the updated 4K studio presentation.',
  'video_url', '/assets/dnn-broadcast-4k.mp4',
  'thumbnail_url', '/assets/dnn-studio.png',
  'production_status', 'complete',
  'tags', jsonb_build_array('DNN', 'Real Estate News', '4K Broadcast', 'featured'),
  'trigger_type', 'housing_market',
  'scope', 'national',
  'audience', 'all',
  'status', 'published',
  'generated_date', now(),
  'published_date', now()
)
where not exists (
  select 1 from public.app_records
  where entity = 'DnnArticle'
    and data->>'headline' = 'DNN Real Estate News — 4K Daily Broadcast'
);
