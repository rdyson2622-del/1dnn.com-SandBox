create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'agent', 'admin')),
  portal_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_entity_idx on public.app_records(entity);
create index if not exists app_records_data_idx on public.app_records using gin(data);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists app_records_touch_updated_at on public.app_records;
create trigger app_records_touch_updated_at before update on public.app_records
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger security definer set search_path = public language plpgsql as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.app_records enable row level security;

create policy "users read own profile" on public.profiles
for select to authenticated using (auth.uid() = id);

create policy "users update own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "signed-in users read records" on public.app_records
for select to authenticated using (true);

create policy "signed-in users create records" on public.app_records
for insert to authenticated with check (true);

create policy "signed-in users update records" on public.app_records
for update to authenticated using (true) with check (true);

create policy "signed-in users delete records" on public.app_records
for delete to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do update set public = true;

create policy "public reads uploaded assets" on storage.objects
for select using (bucket_id = 'public-assets');

create policy "signed-in users upload assets" on storage.objects
for insert to authenticated with check (bucket_id = 'public-assets');

create policy "signed-in users update assets" on storage.objects
for update to authenticated using (bucket_id = 'public-assets');

create policy "signed-in users delete assets" on storage.objects
for delete to authenticated using (bucket_id = 'public-assets');

-- After Bob and Jay sign in once, promote only their accounts in the SQL editor:
-- update public.profiles set role = 'admin' where id in (
--   select id from auth.users where email in ('BOB_EMAIL', 'JAY_EMAIL')
-- );
