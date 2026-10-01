-- ACL → SKI PREP · esquema de Supabase
-- Pega todo en Supabase → SQL Editor → New query → Run.
-- Cada tabla usa (user_id, id) como llave; RLS limita cada fila a su dueño.

create table if not exists public.workout_sessions (
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id           text not null,            -- fecha YYYY-MM-DD
  date         date not null,
  kind         text,                     -- gym | kb | recovery | rest | travel
  phase        int,
  week         int,
  status       text default 'pending',   -- pending | done
  checks       jsonb default '{}'::jsonb, -- ejercicios marcados
  notes        text,
  duration_min int,
  recovery     jsonb,                    -- opciones del sábado
  updated_at   timestamptz not null default now(),
  deleted      boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.exercise_sets (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id          text not null,             -- fecha|ejercicio|serie|lado
  date        date not null,
  exercise_id text not null,
  slot        text,                      -- A1, B2…
  set_no      int not null,
  side        text not null,             -- L | R | B
  weight      numeric,                   -- kg (null = peso corporal)
  reps        numeric,                   -- reps, segundos, metros o cm según el ejercicio
  rpe         numeric,
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.knee_checks (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id          text not null,             -- fecha|momento
  date        date not null,
  moment      text not null,             -- pre | post | next
  pain        int,
  swelling    text,                      -- no | leve | si
  instability boolean,
  motion_loss boolean,
  unusual     boolean,
  light       text,                      -- green | yellow | red
  notes       text,
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.readiness_tests (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,              -- fecha|prueba|lado
  date       date not null,
  test       text not null,
  side       text not null,              -- L | R
  value      numeric,
  notes      text,
  updated_at timestamptz not null default now(),
  deleted    boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.user_settings (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,              -- 'main'
  data       jsonb not null default '{}'::jsonb, -- autorizaciones y evaluaciones de ski readiness
  updated_at timestamptz not null default now(),
  deleted    boolean not null default false,
  primary key (user_id, id)
);

do $$
declare t text;
begin
  foreach t in array array['workout_sessions','exercise_sets','knee_checks','readiness_tests','user_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create index if not exists %I on public.%I (user_id, updated_at)', t || '_updated_idx', t);
  end loop;
end $$;

-- Vista útil para consultas: mejor serie por ejercicio, día y lado
create or replace view public.best_sets with (security_invoker = on) as
select distinct on (user_id, exercise_id, date, side)
  user_id, exercise_id, date, side, weight, reps, rpe
from public.exercise_sets
where not deleted
order by user_id, exercise_id, date, side, coalesce(weight, 0) * (1 + coalesce(reps, 0) / 30.0) desc;
