-- Migration: Add user_id to all tables
-- Run this script in the Supabase SQL Editor

alter table scheduled_activities add column if not exists user_id uuid default auth.uid();
alter table daily_logs add column if not exists user_id uuid default auth.uid();
alter table nutrition_logs add column if not exists user_id uuid default auth.uid();
alter table weekly_checkins add column if not exists user_id uuid default auth.uid();
alter table workout_logs add column if not exists user_id uuid default auth.uid();
alter table activity_deviations add column if not exists user_id uuid default auth.uid();
alter table daily_reports add column if not exists user_id uuid default auth.uid();

-- Update RLS policies to use user_id (Optional/Future-proofing)
-- For now, we just ensure the column exists so logic doesn't break.
