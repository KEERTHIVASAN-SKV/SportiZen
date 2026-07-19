-- =============================================================
-- SPORTIZEN — SCHEMA FIX SCRIPT
-- Run this entire file in the Supabase SQL Editor (one shot).
-- It is idempotent: safe to re-run.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- FIX 1: Add missing columns to `profiles`
-- The code reads/writes `contact_info` (JSONB) on this table.
-- ─────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists contact_info jsonb;


-- ─────────────────────────────────────────────────────────────
-- FIX 2: Add missing `contact_info` column to `player_profiles`
-- ─────────────────────────────────────────────────────────────
alter table public.player_profiles
  add column if not exists contact_info jsonb;


-- ─────────────────────────────────────────────────────────────
-- FIX 3: Add missing `contact_info` column to `coach_profiles`
-- ─────────────────────────────────────────────────────────────
alter table public.coach_profiles
  add column if not exists contact_info jsonb;


-- ─────────────────────────────────────────────────────────────
-- FIX 4: Add missing columns to `events`
-- The code inserts `max_participants` and reads `registration_count`.
-- ─────────────────────────────────────────────────────────────
alter table public.events
  add column if not exists max_participants integer,
  add column if not exists registration_count integer default 0;


-- ─────────────────────────────────────────────────────────────
-- FIX 5: Create the missing `follows` table
-- The entire follow/unfollow/follower-count feature targets this
-- table which was never defined in the original schema.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (follower_id, following_id)
);


-- ─────────────────────────────────────────────────────────────
-- FIX 6: Extend notifications `type` check constraint to include 'follow'
-- The follow notification inserts type='follow' which is not in the original constraint.
-- ─────────────────────────────────────────────────────────────
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'connection_request',
    'connection_accepted',
    'event_registration',
    'verification_status',
    'like',
    'comment',
    'follow'
  ));


-- =============================================================
-- RLS POLICIES
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- follows — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.follows enable row level security;

drop policy if exists "Anyone can view follows" on public.follows;
create policy "Anyone can view follows" on public.follows
  for select using (true);

drop policy if exists "Authenticated users can follow" on public.follows;
create policy "Authenticated users can follow" on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);


-- ─────────────────────────────────────────────────────────────
-- posts — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.posts enable row level security;

drop policy if exists "Anyone can view posts" on public.posts;
create policy "Anyone can view posts" on public.posts
  for select using (true);

drop policy if exists "Authenticated users can create posts" on public.posts;
create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Post owners can update their posts" on public.posts;
create policy "Post owners can update their posts" on public.posts
  for update using (auth.uid() = user_id);

drop policy if exists "Post owners can delete their posts" on public.posts;
create policy "Post owners can delete their posts" on public.posts
  for delete using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- comments — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.comments enable row level security;

drop policy if exists "Anyone can view comments" on public.comments;
create policy "Anyone can view comments" on public.comments
  for select using (true);

drop policy if exists "Authenticated users can comment" on public.comments;
create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "Comment owners can delete" on public.comments;
create policy "Comment owners can delete" on public.comments
  for delete using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- connections — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.connections enable row level security;

drop policy if exists "Participants can view connections" on public.connections;
create policy "Participants can view connections" on public.connections
  for select using (
    auth.uid() = requester_id or auth.uid() = receiver_id
  );

drop policy if exists "Authenticated users can send connections" on public.connections;
create policy "Authenticated users can send connections" on public.connections
  for insert with check (auth.uid() = requester_id);

drop policy if exists "Receiver can update connection status" on public.connections;
create policy "Receiver can update connection status" on public.connections
  for update using (
    auth.uid() = receiver_id or auth.uid() = requester_id
  );


-- ─────────────────────────────────────────────────────────────
-- achievements — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.achievements enable row level security;

drop policy if exists "Anyone can view achievements" on public.achievements;
create policy "Anyone can view achievements" on public.achievements
  for select using (true);

drop policy if exists "Players can add their own achievements" on public.achievements;
create policy "Players can add their own achievements" on public.achievements
  for insert with check (auth.uid() = player_id);

drop policy if exists "Players can delete their own achievements" on public.achievements;
create policy "Players can delete their own achievements" on public.achievements
  for delete using (auth.uid() = player_id);


-- ─────────────────────────────────────────────────────────────
-- notifications — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Allow any authenticated user to INSERT a notification (needed for server-side notifs)
drop policy if exists "Authenticated users can create notifications" on public.notifications;
create policy "Authenticated users can create notifications" on public.notifications
  for insert with check (auth.uid() is not null);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- event_registrations — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.event_registrations enable row level security;

drop policy if exists "Players can view their own registrations" on public.event_registrations;
create policy "Players can view their own registrations" on public.event_registrations
  for select using (
    auth.uid() = player_id
    or exists (
      select 1 from public.events
      where id = event_id and organization_id = auth.uid()
    )
  );

drop policy if exists "Players can register for events" on public.event_registrations;
create policy "Players can register for events" on public.event_registrations
  for insert with check (auth.uid() = player_id);

drop policy if exists "Players can update their own registrations" on public.event_registrations;
create policy "Players can update their own registrations" on public.event_registrations
  for update using (auth.uid() = player_id);


-- ─────────────────────────────────────────────────────────────
-- player_profiles — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.player_profiles enable row level security;

drop policy if exists "Anyone can view player profiles" on public.player_profiles;
create policy "Anyone can view player profiles" on public.player_profiles
  for select using (true);

drop policy if exists "Players can update their own player profile" on public.player_profiles;
create policy "Players can update their own player profile" on public.player_profiles
  for update using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- coach_profiles — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.coach_profiles enable row level security;

drop policy if exists "Anyone can view coach profiles" on public.coach_profiles;
create policy "Anyone can view coach profiles" on public.coach_profiles
  for select using (true);

drop policy if exists "Coaches can update their own profile" on public.coach_profiles;
create policy "Coaches can update their own profile" on public.coach_profiles
  for update using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- org_profiles — enable RLS + policies
-- ─────────────────────────────────────────────────────────────
alter table public.org_profiles enable row level security;

drop policy if exists "Anyone can view org profiles" on public.org_profiles;
create policy "Anyone can view org profiles" on public.org_profiles
  for select using (true);

drop policy if exists "Orgs can update their own profile" on public.org_profiles;
create policy "Orgs can update their own profile" on public.org_profiles
  for update using (auth.uid() = user_id);


-- =============================================================
-- DONE. Also remember to create these Storage Buckets manually
-- in the Supabase Dashboard → Storage → New Bucket (set Public):
--   • covers
--   • post-media
--   • achievement-media
-- =============================================================
