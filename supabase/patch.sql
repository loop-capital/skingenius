-- ============================================
-- SKINgenius PATCH (idempotency + integrity)
-- Run after your table creation blocks
-- ============================================

-- 1) Ensure UUID generator exists
create extension if not exists pgcrypto;

-- 2) Add missing referenced skin condition slug used by FK links
insert into public.skin_conditions (name, slug, category, description)
values (
 'Skin Cancer (Melanoma)',
 'skin-cancer-melanoma',
 'sun_damage',
 'Malignant melanoma; potentially life-threatening skin cancer linked to UV exposure and genetic risk'
)
on conflict (slug) do update
set
 name = excluded.name,
 category = excluded.category,
 description = excluded.description;

-- 3) Keep updated_at fresh automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
 new.updated_at = now();
 return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_ingredients_updated_at on public.ingredients;
create trigger trg_ingredients_updated_at
before update on public.ingredients
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_routines_updated_at on public.routines;
create trigger trg_routines_updated_at
before update on public.routines
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_skin_profiles_updated_at on public.user_skin_profiles;
create trigger trg_user_skin_profiles_updated_at
before update on public.user_skin_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_health_preferences_updated_at on public.user_health_preferences;
create trigger trg_user_health_preferences_updated_at
before update on public.user_health_preferences
for each row execute function public.set_updated_at();

drop trigger if exists trg_supplements_updated_at on public.supplements;
create trigger trg_supplements_updated_at
before update on public.supplements
for each row execute function public.set_updated_at();

drop trigger if exists trg_basys_referrals_updated_at on public.basys_referrals;
create trigger trg_basys_referrals_updated_at
before update on public.basys_referrals
for each row execute function public.set_updated_at();

-- ============================================
-- 4) RLS POLICIES: make re-runs safe
-- Replace your CREATE POLICY section with this
-- ============================================

-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- skin_photos
drop policy if exists "Users can view own photos" on public.skin_photos;
drop policy if exists "Users can insert own photos" on public.skin_photos;
drop policy if exists "Users can delete own photos" on public.skin_photos;

create policy "Users can view own photos" on public.skin_photos for select using (auth.uid() = user_id);
create policy "Users can insert own photos" on public.skin_photos for insert with check (auth.uid() = user_id);
create policy "Users can delete own photos" on public.skin_photos for delete using (auth.uid() = user_id);

-- skin_conditions
drop policy if exists "Anyone can view conditions" on public.skin_conditions;
create policy "Anyone can view conditions" on public.skin_conditions for select using (true);

-- skin_analyses
drop policy if exists "Users can view own analyses" on public.skin_analyses;
drop policy if exists "Users can insert own analyses" on public.skin_analyses;

create policy "Users can view own analyses" on public.skin_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.skin_analyses for insert with check (auth.uid() = user_id);

-- ingredients
drop policy if exists "Anyone can view ingredients" on public.ingredients;
create policy "Anyone can view ingredients" on public.ingredients for select using (true);

-- products
drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products for select using (true);

-- routines
drop policy if exists "Users can view own routines" on public.routines;
drop policy if exists "Users can insert own routines" on public.routines;
drop policy if exists "Users can update own routines" on public.routines;
drop policy if exists "Users can delete own routines" on public.routines;

create policy "Users can view own routines" on public.routines for select using (auth.uid() = user_id);
create policy "Users can insert own routines" on public.routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines" on public.routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines" on public.routines for delete using (auth.uid() = user_id);

-- routine_steps
drop policy if exists "Users can view own routine steps" on public.routine_steps;
drop policy if exists "Users can insert own routine steps" on public.routine_steps;
drop policy if exists "Users can update own routine steps" on public.routine_steps;
drop policy if exists "Users can delete own routine steps" on public.routine_steps;

create policy "Users can view own routine steps" on public.routine_steps
for select using (
 exists (
 select 1
 from public.routines
 where routines.id = routine_steps.routine_id
 and routines.user_id = auth.uid()
 )
);

create policy "Users can insert own routine steps" on public.routine_steps
for insert with check (
 exists (
 select 1
 from public.routines
 where routines.id = routine_steps.routine_id
 and routines.user_id = auth.uid()
 )
);

create policy "Users can update own routine steps" on public.routine_steps
for update using (
 exists (
 select 1
 from public.routines
 where routines.id = routine_steps.routine_id
 and routines.user_id = auth.uid()
 )
);

create policy "Users can delete own routine steps" on public.routine_steps
for delete using (
 exists (
 select 1
 from public.routines
 where routines.id = routine_steps.routine_id
 and routines.user_id = auth.uid()
 )
);

-- user_skin_profiles
drop policy if exists "Users can view own skin profile" on public.user_skin_profiles;
drop policy if exists "Users can insert own skin profile" on public.user_skin_profiles;
drop policy if exists "Users can update own skin profile" on public.user_skin_profiles;

create policy "Users can view own skin profile" on public.user_skin_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own skin profile" on public.user_skin_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own skin profile" on public.user_skin_profiles for update using (auth.uid() = user_id);

-- skin_log_entries
drop policy if exists "Users can view own log entries" on public.skin_log_entries;
drop policy if exists "Users can insert own log entries" on public.skin_log_entries;
drop policy if exists "Users can update own log entries" on public.skin_log_entries;
drop policy if exists "Users can delete own log entries" on public.skin_log_entries;

create policy "Users can view own log entries" on public.skin_log_entries for select using (auth.uid() = user_id);
create policy "Users can insert own log entries" on public.skin_log_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own log entries" on public.skin_log_entries for update using (auth.uid() = user_id);
create policy "Users can delete own log entries" on public.skin_log_entries for delete using (auth.uid() = user_id);

-- ingredient_reactions
drop policy if exists "Users can view own reactions" on public.ingredient_reactions;
drop policy if exists "Users can insert own reactions" on public.ingredient_reactions;
drop policy if exists "Users can delete own reactions" on public.ingredient_reactions;

create policy "Users can view own reactions" on public.ingredient_reactions for select using (auth.uid() = user_id);
create policy "Users can insert own reactions" on public.ingredient_reactions for insert with check (auth.uid() = user_id);
create policy "Users can delete own reactions" on public.ingredient_reactions for delete using (auth.uid() = user_id);

-- extended read-only refs
drop policy if exists "Anyone can view root_causes" on public.root_causes;
drop policy if exists "Anyone can view mechanisms" on public.mechanisms;
drop policy if exists "Anyone can view supplements" on public.supplements;
drop policy if exists "Anyone can view medications" on public.medications;
drop policy if exists "Anyone can view cause_condition_links" on public.cause_condition_links;
drop policy if exists "Anyone can view mechanism_chains" on public.mechanism_chains;
drop policy if exists "Anyone can view medication_condition_links" on public.medication_condition_links;
drop policy if exists "Anyone can view product_root_cause_links" on public.product_root_cause_links;

create policy "Anyone can view root_causes" on public.root_causes for select using (true);
create policy "Anyone can view mechanisms" on public.mechanisms for select using (true);
create policy "Anyone can view supplements" on public.supplements for select using (true);
create policy "Anyone can view medications" on public.medications for select using (true);
create policy "Anyone can view cause_condition_links" on public.cause_condition_links for select using (true);
create policy "Anyone can view mechanism_chains" on public.mechanism_chains for select using (true);
create policy "Anyone can view medication_condition_links" on public.medication_condition_links for select using (true);
create policy "Anyone can view product_root_cause_links" on public.product_root_cause_links for select using (true);

-- extended user tables
drop policy if exists "Users can view own health assessments" on public.user_health_assessments;
drop policy if exists "Users can insert own health assessments" on public.user_health_assessments;
drop policy if exists "Users can view own preferences" on public.user_health_preferences;
drop policy if exists "Users can manage own preferences" on public.user_health_preferences;
drop policy if exists "Users can view own recommendations" on public.recommendations;
drop policy if exists "Users can update own recommendations" on public.recommendations;
drop policy if exists "Users can insert own referrals" on public.basys_referrals;
drop policy if exists "Users can view own referrals" on public.basys_referrals;
drop policy if exists "Users can view own referral intents" on public.basys_referral_intents;
drop policy if exists "Users can insert own referral intents" on public.basys_referral_intents;

create policy "Users can view own health assessments" on public.user_health_assessments for select using (auth.uid() = user_id);
create policy "Users can insert own health assessments" on public.user_health_assessments for insert with check (auth.uid() = user_id);
create policy "Users can view own preferences" on public.user_health_preferences for select using (auth.uid() = user_id);
create policy "Users can manage own preferences" on public.user_health_preferences for all using (auth.uid() = user_id);
create policy "Users can view own recommendations" on public.recommendations for select using (auth.uid() = user_id);
create policy "Users can update own recommendations" on public.recommendations for update using (auth.uid() = user_id);
create policy "Users can insert own referrals" on public.basys_referrals for insert with check (auth.uid() = user_id);
create policy "Users can view own referrals" on public.basys_referrals for select using (auth.uid() = user_id);
create policy "Users can view own referral intents" on public.basys_referral_intents for select using (auth.uid() = user_id);
create policy "Users can insert own referral intents" on public.basys_referral_intents for insert with check (auth.uid() = user_id);

-- storage.objects (bucket-specific)
drop policy if exists "Users can upload own photos" on storage.objects;
drop policy if exists "Users can view own photos" on storage.objects;
drop policy if exists "Users can delete own photos" on storage.objects;

create policy "Users can upload own photos" on storage.objects
for insert with check (
 bucket_id = 'skin-photos'
 and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view own photos" on storage.objects
for select using (
 bucket_id = 'skin-photos'
 and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own photos" on storage.objects
for delete using (
 bucket_id = 'skin-photos'
 and auth.uid()::text = (storage.foldername(name))[1]
);
