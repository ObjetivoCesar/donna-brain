-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Clean up existing tables (Optional, use with caution)
-- drop table if exists daily_logs;
-- drop table if exists nutrition_logs;
-- drop table if exists weekly_checkins;
-- drop table if exists workout_sessions;
-- drop table if exists scheduled_activities;

-- 3. Tabla: scheduled_activities (Actividades del Planner)
create table scheduled_activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  day text not null, -- 'Lunes', 'Martes', etc.
  time text not null, -- '08:00-09:00'
  activity text not null,
  focus text not null,
  category text check (category in ('living', 'motivation', 'work')),
  created_at timestamp with time zone default now()
);

-- 4. Tabla: daily_logs (Registros Diarios: sueño, estrés, peso)
create table daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  date date not null unique, -- Solo un log por día
  weight numeric(5,2),
  steps integer,
  sleep_quality integer check (sleep_quality between 0 and 5),
  stress_level integer check (stress_level between 0 and 5),
  hunger_level integer check (hunger_level between 0 and 5),
  fatigue_level integer check (fatigue_level between 0 and 5),
  notes text,
  created_at timestamp with time zone default now()
);

-- 5. Tabla: nutrition_logs (Comidas registradas - FitAI)
create table nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  date date not null,
  name text not null,
  calories numeric(6,2),
  protein numeric(6,2),
  carbs numeric(6,2),
  fat numeric(6,2),
  meal_type text not null, -- 'Desayuno', 'Almuerzo', etc.
  summary text,
  created_at timestamp with time zone default now()
);

-- 6. Tabla: weekly_checkins (Medidas semanales y promedios)
create table weekly_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  date date not null, -- Usually Sunday
  week_start_date date not null,
  
  -- Averages
  avg_weight numeric(5,2),
  avg_sleep numeric(3,1),
  avg_stress numeric(3,1),
  
  -- Measurements
  chest numeric(5,2),
  arm_left numeric(5,2),
  arm_right numeric(5,2),
  waist_upper numeric(5,2),
  waist_navel numeric(5,2),
  waist_lower numeric(5,2),
  hips numeric(5,2),
  thigh_left numeric(5,2),
  thigh_right numeric(5,2),
  calf_left numeric(5,2),
  calf_right numeric(5,2),
  
  -- Photos (Array of BunnyNet URLs)
  photos text[], 
  
  notes text,
  created_at timestamp with time zone default now()
);

-- 7. Tabla: workout_logs (Historial de ejercicios)
create table workout_logs (
   id uuid primary key default uuid_generate_v4(),
   user_id uuid default auth.uid(),
   date date not null,
   exercise_name text not null,
   
   -- JSONB para guardar sets complejos (peso, reps, rpe) flexiblemente
   -- Estructura: [{weight: 100, reps: 10, rpe: 8}, ...]
   sets jsonb not null default '[]'::jsonb,
   
   notes text,
   created_at timestamp with time zone default now()
);

-- 8. Tabla: activity_deviations (Desviaciones del plan - Reportes)
create table activity_deviations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  date date not null,
  original_activity text,
  actual_activity text,
  reason text,
  timestamp timestamp with time zone default now()
);

-- 9. Tabla: daily_reports (Historial de informes generados)
create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  date date not null,
  report_content text, -- Markdown almacenado
  adherence_score integer, -- Porcentaje 0-100
  created_at timestamp with time zone default now()
);

-- 10. Tabla: nutrition_favorites (Comidas favoritas)
create table nutrition_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid default auth.uid(),
  name text not null,
  calories numeric(6,2),
  protein numeric(6,2),
  carbs numeric(6,2),
  fat numeric(6,2),
  default_meal_type text,
  created_at timestamp with time zone default now()
);

-- 11. Tabla: user_settings (Metas y configuraciones)
create table user_settings (
  user_id uuid primary key default auth.uid(),
  nutrition_goals jsonb default '{"calories": 2500, "protein": 180, "carbs": 250, "fat": 80, "waterIntakeMl": 3000}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Row Level Security (RLS) - Opcional si es app personal de un solo usuario, pero recomendado
alter table scheduled_activities enable row level security;
alter table daily_logs enable row level security;
alter table nutrition_logs enable row level security;
alter table weekly_checkins enable row level security;
alter table workout_logs enable row level security;
alter table activity_deviations enable row level security;
alter table daily_reports enable row level security;
alter table nutrition_favorites enable row level security;
alter table user_settings enable row level security;

-- Policies (Permitir todo al anon key por ahora para desarrollo personal)
create policy "Allow all actions for anon" on scheduled_activities for all using (true);
create policy "Allow all actions for anon" on daily_logs for all using (true);
create policy "Allow all actions for anon" on nutrition_logs for all using (true);
create policy "Allow all actions for anon" on weekly_checkins for all using (true);
create policy "Allow all actions for anon" on workout_logs for all using (true);
create policy "Allow all actions for anon" on activity_deviations for all using (true);
create policy "Allow all actions for anon" on daily_reports for all using (true);
create policy "Allow all actions for anon" on nutrition_favorites for all using (true);
create policy "Allow all actions for anon" on user_settings for all using (true);
