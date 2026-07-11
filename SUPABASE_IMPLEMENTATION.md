# Supabase Migration & Database Schema Details

This document outlines how to replace the current client-side mock database service (`mockDb.ts`) with a live **Supabase Backend** (PostgreSQL, Supabase Auth, Storage, and RLS).

---

## 1. Database Schema DDL (PostgreSQL)

You can run the following SQL scripts in the **Supabase SQL Editor** to initialize the database tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE TABLE (EXTENDED SYSTEM USER)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  name text not null,
  email text unique not null,
  role text not null check (role in ('player', 'coach', 'organization')),
  profile_picture text,
  cover_photo text,
  sport text default 'Other',
  location text,
  bio text,
  experience text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PLAYER PROFILES (NESTED STRUCTURE)
create table public.player_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  age integer,
  gender text check (gender in ('Male', 'Female', 'Other')),
  sport text not null,
  position text,
  bio text,
  location text,
  verification_status text default 'none' check (verification_status in ('pending', 'verified', 'rejected', 'none'))
);

-- 3. COACH PROFILES
create table public.coach_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  experience text not null,
  certifications text[] default '{}'::text[],
  sports_category text not null,
  bio text,
  location text,
  rating numeric(3,2) default 5.0 check (rating >= 0.0 and rating <= 5.0)
);

-- 4. ORGANIZATION PROFILES
create table public.org_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  organization_name text not null,
  address text not null,
  description text,
  website text,
  phone text
);

-- 5. TOURNAMENTS & EVENTS
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.profiles(id) on delete cascade not null,
  organization_name text not null,
  event_name text not null,
  sport text not null,
  venue text not null,
  eligibility text not null,
  date date not null,
  registration_deadline date not null,
  description text not null,
  poster_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. EVENT REGISTRATIONS
create table public.event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  player_name text not null,
  player_sport text not null,
  registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'registered' check (status in ('registered', 'cancelled')),
  notes text,
  unique (event_id, player_id)
);

-- 7. CONNECTIONS (ATHLETE-TO-COACH)
create table public.connections (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (requester_id, receiver_id)
);

-- 8. ATHLETE ACHIEVEMENTS
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  date date not null,
  type text not null check (type in ('medal', 'trophy', 'certificate', 'record')),
  image_url text,
  certificate_url text
);

-- 9. VERIFICATION DOCUMENTS
create table public.verification_documents (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.profiles(id) on delete cascade not null,
  player_name text not null,
  document_type text not null check (document_type in ('college_id', 'sports_certificate')),
  file_url text not null,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ai_analysis_result text
);

-- 10. SOCIAL POSTS
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  username text not null,
  name text not null,
  role text not null,
  profile_picture text,
  content text not null,
  image text,
  type text default 'general' check (type in ('general', 'achievement', 'milestone', 'coaching_update', 'announcement')),
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  likes uuid[] default '{}'::uuid[]
);

-- 11. COMMENTS
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  username text not null,
  content text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. NOTIFICATIONS
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('connection_request', 'connection_accepted', 'event_registration', 'verification_status', 'like', 'comment')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 2. Automating Profile Creation via Triggers

To automatically populate the `public.profiles` and role-specific profile tables whenever a user registers through Supabase Auth, create a PostgreSQL trigger function:

```sql
-- Trigger Function
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_name text;
  user_username text;
  user_sport text;
  user_location text;
begin
  -- Fetch role details passed via metadata during registration
  user_role := coalesce(new.raw_user_meta_data->>'role', 'player');
  user_name := coalesce(new.raw_user_meta_data->>'name', 'New User');
  user_username := coalesce(new.raw_user_meta_data->>'username', substring(new.email from '(.*)@'));
  user_sport := coalesce(new.raw_user_meta_data->>'sport', 'Other');
  user_location := coalesce(new.raw_user_meta_data->>'location', '');

  -- Insert profile
  insert into public.profiles (id, username, name, email, role, sport, location)
  values (new.id, user_username, user_name, new.email, user_role, user_sport, user_location);

  -- Insert nested profile based on role
  if user_role = 'player' then
    insert into public.player_profiles (user_id, sport, location, verification_status)
    values (new.id, user_sport, user_location, 'none');
  elsif user_role = 'coach' then
    insert into public.coach_profiles (user_id, experience, sports_category, location)
    values (new.id, '0 years', user_sport, user_location);
  elsif user_role = 'organization' then
    insert into public.org_profiles (user_id, organization_name, address)
    values (new.id, user_name, user_location);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger attachment
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 3. Storage Buckets

Configure the following **Public Storage Buckets** inside your Supabase dashboard:

1.  `avatars/` - Athlete, coach and org profile avatar images.
2.  `certificates/` - Sports and education certificates uploaded by players for verification review.
3.  `achievements/` - Medals and trophies photos.
4.  `event-posters/` - Tournament and match posters uploaded by organizations.
5.  `videos/` - Training drills and match clip reels.

---

## 4. Row Level Security (RLS) Policies

Enable RLS on tables to secure the database. Here are typical configuration rules:

```sql
-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles: Anyone can view, only owner can edit
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow updates to owner profiles" on public.profiles
  for update using (auth.uid() = id);

-- Events: Anyone can view, only Organization users can create/update
alter table public.events enable row level security;

create policy "Allow public read access to events" on public.events
  for select using (true);

create policy "Allow event creation for authenticated Orgs" on public.events
  for insert with check (
    auth.uid() = organization_id and 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'organization'
    )
  );

-- Verification Documents: Player uploads, Orgs approve/read
alter table public.verification_documents enable row level security;

create policy "Players can select their own docs" on public.verification_documents
  for select using (auth.uid() = player_id);

create policy "Orgs can review all verification docs" on public.verification_documents
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'organization'
    )
  );

create policy "Players can upload docs" on public.verification_documents
  for insert with check (auth.uid() = player_id);

create policy "Orgs can update verification status" on public.verification_documents
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'organization'
    )
  );
```

---

## 5. Client Integration Code Example

Once Supabase is active, you can swap the mock query code blocks in your UI. Example replacement for fetching tournaments and posts:

### Setting up the Environment
Create a `.env` file in the workspace root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-string
```

### Swapping queries in React Components
```typescript
import { supabase } from '../lib/supabase';
import { Post } from '../types';

// Fetch feed posts
const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, image, type, timestamp, likes,
      user:user_id ( name, username, profile_picture, role )
    `)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  
  // Map PostgreSQL relational structure back to flat UI types
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    content: item.content,
    image: item.image,
    type: item.type,
    timestamp: item.timestamp,
    likes: item.likes || [],
    name: item.user.name,
    username: item.user.username,
    profilePicture: item.user.profile_picture,
    role: item.user.role,
    comments: [] // fetch relational comments separately or join
  }));
};

// Insert a post
const createPost = async (content: string, type: string, image?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      type,
      image
    });

  if (error) throw error;
};
```
