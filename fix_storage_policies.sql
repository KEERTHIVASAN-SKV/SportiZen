-- =============================================================
-- SPORTIZEN — STORAGE BUCKET POLICIES
-- Run this in the Supabase SQL Editor after creating all buckets.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PUBLIC READ on all public buckets (avatars, covers, event-posters,
-- achievement-media, post-media, achievements, videos)
-- ─────────────────────────────────────────────────────────────
create policy "Public read on avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Public read on covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Public read on event-posters"
  on storage.objects for select
  using (bucket_id = 'event-posters');

create policy "Public read on achievement-media"
  on storage.objects for select
  using (bucket_id = 'achievement-media');

create policy "Public read on post-media"
  on storage.objects for select
  using (bucket_id = 'post-media');

create policy "Public read on achievements"
  on storage.objects for select
  using (bucket_id = 'achievements');

create policy "Public read on videos"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "Public read on certificates"
  on storage.objects for select
  using (bucket_id = 'certificates');


-- ─────────────────────────────────────────────────────────────
-- AUTHENTICATED UPLOADS — each bucket scoped to auth.uid()
-- ─────────────────────────────────────────────────────────────

-- avatars: users upload their own avatar (path starts with their uid)
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- covers: users upload their own cover photo
create policy "Users can upload their own cover"
  on storage.objects for insert
  with check (
    bucket_id = 'covers'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own cover"
  on storage.objects for update
  using (
    bucket_id = 'covers'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- event-posters: orgs upload event posters
create policy "Authenticated users can upload event posters"
  on storage.objects for insert
  with check (
    bucket_id = 'event-posters'
    and auth.uid() is not null
  );

-- achievement-media: players upload achievement images
create policy "Players can upload achievement media"
  on storage.objects for insert
  with check (
    bucket_id = 'achievement-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- post-media: authenticated users upload post images/videos
create policy "Authenticated users can upload post media"
  on storage.objects for insert
  with check (
    bucket_id = 'post-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- certificates: players upload their own verification docs
create policy "Players can upload certificates"
  on storage.objects for insert
  with check (
    bucket_id = 'certificates'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- videos: authenticated users upload videos
create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and auth.uid() is not null
  );
