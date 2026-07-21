-- =============================================================
-- SPORTIZEN — COMPLETE DATABASE SCHEMA
-- Matches the exact live Supabase schema.
--
-- Run this entire file in the Supabase SQL Editor to recreate
-- the database from scratch.
--
-- Sections:
--   1. Extensions
--   2. Tables  (exact match to live Supabase schema)
--   3. Row Level Security (RLS) policies
--   4. Trigger — auto-create role profile on signup
--   5. Storage bucket policies
-- =============================================================


-- =============================================================
-- 1. EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- 2. TABLES
-- =============================================================

-- -------------------------------------------------------------
-- profiles
-- Central user table. One row per auth.users entry.
-- -------------------------------------------------------------
CREATE TABLE public.profiles (
  id              uuid NOT NULL,
  username        text NOT NULL UNIQUE,
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  role            text NOT NULL CHECK (role = ANY (ARRAY['player'::text, 'coach'::text, 'organization'::text])),
  profile_picture text,
  cover_photo     text,
  sport           text DEFAULT 'Other'::text,
  location        text,
  bio             text,
  experience      text,
  created_at      timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  contact_info    jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);


-- -------------------------------------------------------------
-- player_profiles
-- Extended data for users with role='player'
-- -------------------------------------------------------------
CREATE TABLE public.player_profiles (
  id                  uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL UNIQUE,
  age                 integer,
  gender              text CHECK (gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Other'::text])),
  sport               text NOT NULL,
  position            text,
  bio                 text,
  location            text,
  verification_status text DEFAULT 'none'::text CHECK (verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'none'::text])),
  contact_info        jsonb,
  CONSTRAINT player_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT player_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- coach_profiles
-- Extended data for users with role='coach'
-- -------------------------------------------------------------
CREATE TABLE public.coach_profiles (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL UNIQUE,
  experience      text NOT NULL,
  certifications  text[] DEFAULT '{}'::text[],
  sports_category text NOT NULL,
  bio             text,
  location        text,
  rating          numeric DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  contact_info    jsonb,
  CONSTRAINT coach_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT coach_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- org_profiles
-- Extended data for users with role='organization'
-- -------------------------------------------------------------
CREATE TABLE public.org_profiles (
  id                uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id           uuid NOT NULL UNIQUE,
  organization_name text NOT NULL,
  address           text NOT NULL,
  description       text,
  website           text,
  phone             text,
  CONSTRAINT org_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT org_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- events
-- Sports events/tournaments created by organizations
-- -------------------------------------------------------------
CREATE TABLE public.events (
  id                    uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id       uuid NOT NULL,
  organization_name     text NOT NULL,
  event_name            text NOT NULL,
  sport                 text NOT NULL,
  venue                 text NOT NULL,
  eligibility           text NOT NULL,
  date                  date NOT NULL,
  registration_deadline date NOT NULL,
  description           text NOT NULL,
  poster_url            text,
  created_at            timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  max_participants      integer,
  registration_count    integer DEFAULT 0,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- event_registrations
-- Tracks which players registered for which events
-- -------------------------------------------------------------
CREATE TABLE public.event_registrations (
  id                uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id          uuid NOT NULL,
  player_id         uuid NOT NULL,
  player_name       text NOT NULL,
  player_sport      text NOT NULL,
  registration_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status            text DEFAULT 'registered'::text CHECK (status = ANY (ARRAY['registered'::text, 'cancelled'::text])),
  notes             text,
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- connections
-- Coach <-> Player connection requests
-- -------------------------------------------------------------
CREATE TABLE public.connections (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL,
  receiver_id  uuid NOT NULL,
  status       text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at   timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT connections_pkey PRIMARY KEY (id),
  CONSTRAINT connections_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
  CONSTRAINT connections_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- achievements
-- Player trophies, medals, certificates, and records
-- -------------------------------------------------------------
CREATE TABLE public.achievements (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id       uuid NOT NULL,
  title           text NOT NULL,
  description     text NOT NULL,
  date            date NOT NULL,
  type            text NOT NULL CHECK (type = ANY (ARRAY['medal'::text, 'trophy'::text, 'certificate'::text, 'record'::text])),
  image_url       text,
  certificate_url text,
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- verification_documents
-- Documents uploaded by players for identity/achievement proof.
-- Reviewed manually by Academy organizations.
-- Note: ai_analysis_result column is retained for DB compatibility
-- but is no longer written to by the application.
-- -------------------------------------------------------------
CREATE TABLE public.verification_documents (
  id               uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id        uuid NOT NULL,
  player_name      text NOT NULL,
  document_type    text NOT NULL CHECK (document_type = ANY (ARRAY['college_id'::text, 'sports_certificate'::text])),
  file_url         text NOT NULL,
  status           text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])),
  uploaded_at      timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ai_analysis_result text,
  CONSTRAINT verification_documents_pkey PRIMARY KEY (id),
  CONSTRAINT verification_documents_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- posts
-- Social feed posts by any user role
-- -------------------------------------------------------------
CREATE TABLE public.posts (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL,
  username        text NOT NULL,
  name            text NOT NULL,
  role            text NOT NULL,
  profile_picture text,
  content         text NOT NULL,
  image           text,
  type            text DEFAULT 'general'::text CHECK (type = ANY (ARRAY['general'::text, 'achievement'::text, 'milestone'::text, 'coaching_update'::text, 'announcement'::text])),
  timestamp       timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  likes           uuid[] DEFAULT '{}'::uuid[],
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- comments
-- Comments on posts
-- -------------------------------------------------------------
CREATE TABLE public.comments (
  id        uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id   uuid NOT NULL,
  user_id   uuid NOT NULL,
  username  text NOT NULL,
  content   text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- notifications
-- In-app notifications for users
-- -------------------------------------------------------------
CREATE TABLE public.notifications (
  id         uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  type       text NOT NULL CHECK (type = ANY (ARRAY['connection_request'::text, 'connection_accepted'::text, 'event_registration'::text, 'verification_status'::text, 'like'::text, 'comment'::text, 'follow'::text])),
  is_read    boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);


-- -------------------------------------------------------------
-- follows
-- Generic follow relationships between any users
-- -------------------------------------------------------------
CREATE TABLE public.follows (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  follower_id  uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at   timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);


-- =============================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- player_profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view player profiles" ON public.player_profiles;
CREATE POLICY "Anyone can view player profiles" ON public.player_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can insert their own player profile" ON public.player_profiles;
CREATE POLICY "Players can insert their own player profile" ON public.player_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players can update their own player profile" ON public.player_profiles;
CREATE POLICY "Players can update their own player profile" ON public.player_profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- coach_profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view coach profiles" ON public.coach_profiles;
CREATE POLICY "Anyone can view coach profiles" ON public.coach_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can insert their own profile" ON public.coach_profiles;
CREATE POLICY "Coaches can insert their own profile" ON public.coach_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can update their own profile" ON public.coach_profiles;
CREATE POLICY "Coaches can update their own profile" ON public.coach_profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- org_profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.org_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view org profiles" ON public.org_profiles;
CREATE POLICY "Anyone can view org profiles" ON public.org_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Orgs can insert their own profile" ON public.org_profiles;
CREATE POLICY "Orgs can insert their own profile" ON public.org_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Orgs can update their own profile" ON public.org_profiles;
CREATE POLICY "Orgs can update their own profile" ON public.org_profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- events
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizations can create events" ON public.events;
CREATE POLICY "Organizations can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = organization_id);

DROP POLICY IF EXISTS "Organizations can update their events" ON public.events;
CREATE POLICY "Organizations can update their events" ON public.events
  FOR UPDATE USING (auth.uid() = organization_id);

DROP POLICY IF EXISTS "Organizations can delete their events" ON public.events;
CREATE POLICY "Organizations can delete their events" ON public.events
  FOR DELETE USING (auth.uid() = organization_id);


-- ─────────────────────────────────────────────────────────────
-- event_registrations
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view their own registrations" ON public.event_registrations;
CREATE POLICY "Players can view their own registrations" ON public.event_registrations
  FOR SELECT USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND organization_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Players can register for events" ON public.event_registrations;
CREATE POLICY "Players can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can update their own registrations" ON public.event_registrations;
CREATE POLICY "Players can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = player_id);


-- ─────────────────────────────────────────────────────────────
-- connections
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view connections" ON public.connections;
CREATE POLICY "Participants can view connections" ON public.connections
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Authenticated users can send connections" ON public.connections;
CREATE POLICY "Authenticated users can send connections" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Receiver can update connection status" ON public.connections;
CREATE POLICY "Receiver can update connection status" ON public.connections
  FOR UPDATE USING (
    auth.uid() = receiver_id OR auth.uid() = requester_id
  );


-- ─────────────────────────────────────────────────────────────
-- achievements
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can add their own achievements" ON public.achievements;
CREATE POLICY "Players can add their own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can delete their own achievements" ON public.achievements;
CREATE POLICY "Players can delete their own achievements" ON public.achievements
  FOR DELETE USING (auth.uid() = player_id);


-- ─────────────────────────────────────────────────────────────
-- verification_documents
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view their own documents" ON public.verification_documents;
CREATE POLICY "Players can view their own documents" ON public.verification_documents
  FOR SELECT USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organization'
    )
  );

DROP POLICY IF EXISTS "Players can upload verification documents" ON public.verification_documents;
CREATE POLICY "Players can upload verification documents" ON public.verification_documents
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Organizations can update document status" ON public.verification_documents;
CREATE POLICY "Organizations can update document status" ON public.verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organization'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- posts
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post owners can update their posts" ON public.posts;
CREATE POLICY "Post owners can update their posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post owners can delete their posts" ON public.posts;
CREATE POLICY "Post owners can delete their posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- comments
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comment owners can delete" ON public.comments;
CREATE POLICY "Comment owners can delete" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- follows
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);


-- =============================================================
-- 4. TRIGGER — Auto-create role profile row on signup
--    When a new profile row is inserted, automatically create
--    the matching player_profiles / coach_profiles / org_profiles
--    row so the app can always join on them.
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'player' THEN
    INSERT INTO public.player_profiles (user_id, sport)
    VALUES (NEW.id, NEW.sport)
    ON CONFLICT (user_id) DO NOTHING;

  ELSIF NEW.role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, sports_category, experience)
    VALUES (NEW.id, COALESCE(NEW.sport, 'Other'), 'Not specified')
    ON CONFLICT (user_id) DO NOTHING;

  ELSIF NEW.role = 'organization' THEN
    INSERT INTO public.org_profiles (user_id, organization_name, address)
    VALUES (NEW.id, NEW.name, 'Not specified')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile();


-- =============================================================
-- 5. STORAGE BUCKET POLICIES
--
-- Run AFTER creating the following buckets in the Supabase
-- Dashboard → Storage → New Bucket (set each as Public):
--
--   Bucket name       | Purpose
--   ------------------|-------------------------------------
--   avatars           | User profile pictures
--   covers            | User cover photos
--   event-posters     | Event poster images
--   post-media        | Images attached to feed posts
--   achievement-media | Images attached to achievements
--   certificates      | Player verification documents
-- =============================================================

-- Public read on all public buckets
CREATE POLICY "Public read on avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public read on covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Public read on event-posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-posters');

CREATE POLICY "Public read on achievement-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'achievement-media');

CREATE POLICY "Public read on post-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

CREATE POLICY "Public read on certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- avatars: users upload and update their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- covers: users upload and update their own cover photo
CREATE POLICY "Users can upload their own cover"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own cover"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- event-posters: organizations upload event posters
CREATE POLICY "Authenticated users can upload event posters"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-posters'
    AND auth.uid() IS NOT NULL
  );

-- achievement-media: players upload achievement images
CREATE POLICY "Players can upload achievement media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'achievement-media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- post-media: authenticated users upload post images
CREATE POLICY "Authenticated users can upload post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- certificates: players upload their own verification documents
CREATE POLICY "Players can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================
-- DONE. SportiZen database is fully configured.
-- =============================================================
