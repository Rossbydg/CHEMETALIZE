alter table creator_profile
  add column if not exists tiktok_open_id text,
  add column if not exists tiktok_display_name text,
  add column if not exists tiktok_avatar_url text,
  add column if not exists tiktok_follower_count integer,
  add column if not exists tiktok_following_count integer,
  add column if not exists tiktok_likes_count integer,
  add column if not exists tiktok_video_count integer,
  add column if not exists tiktok_access_token text,
  add column if not exists tiktok_refresh_token text,
  add column if not exists tiktok_token_expires_at timestamptz,
  add column if not exists tiktok_connected_at timestamptz;
