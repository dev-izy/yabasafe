-- YabaSafe Alert: initial schema, RLS and realtime

create type public.user_role as enum ('student', 'guardian', 'officer', 'admin');
create type public.alert_type as enum ('fire', 'security', 'medical', 'general', 'drill');
create type public.audience_kind as enum ('all', 'department', 'hostel');
create type public.alert_status as enum ('active', 'cleared');
create type public.link_status as enum ('pending', 'approved');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text not null default '',
  matric_no text unique,
  department text,
  hostel text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.link_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (guardian_id, student_id)
);

create table public.muster_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  type public.alert_type not null,
  area text not null,
  instructions text not null,
  muster_point_id uuid references public.muster_points (id) on delete set null,
  audience_kind public.audience_kind not null default 'all',
  audience_value text,
  status public.alert_status not null default 'active',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  cleared_at timestamptz,
  clear_message text,
  check (audience_kind = 'all' or audience_value is not null)
);

create table public.acknowledgements (
  alert_id uuid not null references public.alerts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  safe_at timestamptz not null default now(),
  primary key (alert_id, user_id)
);

create index on public.alerts (status, created_at desc);
create index on public.guardian_links (student_id);
create index on public.guardian_links (guardian_id);
create index on public.acknowledgements (user_id);

-- Helpers (security definer so policies never recurse) ---------------------

create function public.app_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.app_role() in ('officer', 'admin'), false) $$;

create function public.in_audience(a public.alerts, uid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select a.audience_kind = 'all'
    or exists (
      select 1 from public.profiles p
      where p.id = uid and (
        (a.audience_kind = 'department' and p.department = a.audience_value) or
        (a.audience_kind = 'hostel' and p.hostel = a.audience_value))
    )
    or exists (
      select 1 from public.guardian_links g
      join public.profiles s on s.id = g.student_id
      where g.guardian_id = uid and g.status = 'approved' and (
        (a.audience_kind = 'department' and s.department = a.audience_value) or
        (a.audience_kind = 'hostel' and s.hostel = a.audience_value))
    )
$$;

-- New auth user -> profile (role limited to student/guardian) -------------

create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r public.user_role;
  sid uuid;
begin
  r := case when m ->> 'role' = 'guardian' then 'guardian'::public.user_role
            else 'student'::public.user_role end;

  insert into public.profiles (id, role, full_name, matric_no, department, hostel, phone)
  values (
    new.id, r, coalesce(trim(m ->> 'full_name'), ''),
    case when r = 'student' then nullif(upper(trim(m ->> 'matric_no')), '') end,
    nullif(trim(m ->> 'department'), ''),
    nullif(trim(m ->> 'hostel'), ''),
    nullif(trim(m ->> 'phone'), '')
  );

  if r = 'guardian' and nullif(trim(m ->> 'ward_matric_no'), '') is not null then
    select id into sid from public.profiles
    where matric_no = upper(trim(m ->> 'ward_matric_no')) and role = 'student';
    if sid is not null then
      insert into public.guardian_links (guardian_id, student_id) values (new.id, sid);
    end if;
  end if;
  return new;
end
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Monitor RPCs (staff only) -----------------------------------------------

create function public.alert_stats(p_alert uuid)
returns table (targeted int, safe int)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'not allowed'; end if;
  return query
  select
    (select count(*)::int from public.alerts a, public.profiles p
      where a.id = p_alert and p.role in ('student', 'guardian') and public.in_audience(a, p.id)),
    (select count(*)::int from public.acknowledgements where alert_id = p_alert);
end
$$;

create function public.alert_pending(p_alert uuid)
returns table (id uuid, full_name text, role public.user_role, matric_no text, phone text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'not allowed'; end if;
  return query
  select p.id, p.full_name, p.role, p.matric_no, p.phone
  from public.alerts a, public.profiles p
  where a.id = p_alert and p.role in ('student', 'guardian') and public.in_audience(a, p.id)
    and not exists (select 1 from public.acknowledgements k where k.alert_id = a.id and k.user_id = p.id)
  order by p.full_name
  limit 100;
end
$$;

revoke execute on function public.app_role() from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.in_audience(public.alerts, uuid) from public, anon;
revoke execute on function public.alert_stats(uuid) from public, anon;
revoke execute on function public.alert_pending(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.app_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.in_audience(public.alerts, uuid) to authenticated;
grant execute on function public.alert_stats(uuid) to authenticated;
grant execute on function public.alert_pending(uuid) to authenticated;

-- Row level security -------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.guardian_links enable row level security;
alter table public.muster_points enable row level security;
alter table public.alerts enable row level security;
alter table public.acknowledgements enable row level security;

-- profiles
create policy "read own or staff" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_staff()));
create policy "read linked people" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.guardian_links g
    where (g.guardian_id = (select auth.uid()) and g.student_id = profiles.id)
       or (g.student_id = (select auth.uid()) and g.guardian_id = profiles.id)));
create policy "update own, role fixed" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select public.app_role()));

-- guardian_links: students approve, either side can remove
create policy "read own links" on public.guardian_links for select to authenticated
  using (guardian_id = (select auth.uid()) or student_id = (select auth.uid()) or (select public.is_staff()));
create policy "student approves" on public.guardian_links for update to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
create policy "either side removes" on public.guardian_links for delete to authenticated
  using (guardian_id = (select auth.uid()) or student_id = (select auth.uid()));
revoke update on public.guardian_links from authenticated;
grant update (status) on public.guardian_links to authenticated;

-- muster points
create policy "everyone reads" on public.muster_points for select to authenticated using (true);
create policy "staff insert" on public.muster_points for insert to authenticated
  with check ((select public.is_staff()));
create policy "staff update" on public.muster_points for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff delete" on public.muster_points for delete to authenticated
  using ((select public.is_staff()));

-- alerts
create policy "read alerts for audience" on public.alerts for select to authenticated
  using ((select public.is_staff()) or public.in_audience(alerts, (select auth.uid())));
create policy "staff create" on public.alerts for insert to authenticated
  with check ((select public.is_staff()) and created_by = (select auth.uid()));
create policy "staff update" on public.alerts for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- acknowledgements ("I am Safe")
create policy "read own, ward or staff" on public.acknowledgements for select to authenticated
  using (
    user_id = (select auth.uid()) or (select public.is_staff())
    or exists (select 1 from public.guardian_links g
      where g.guardian_id = (select auth.uid()) and g.student_id = acknowledgements.user_id and g.status = 'approved'));
create policy "mark self safe" on public.acknowledgements for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.alerts a where a.id = alert_id and a.status = 'active'));
create policy "undo own" on public.acknowledgements for delete to authenticated
  using (user_id = (select auth.uid()));

-- Realtime -----------------------------------------------------------------
alter publication supabase_realtime add table public.alerts, public.acknowledgements;

-- Sample muster points (edit in the admin dashboard) -----------------------
insert into public.muster_points (name, description, sort) values
  ('Muster Point A', 'Open ground beside the Library', 1),
  ('Muster Point B', 'Main sports field', 2),
  ('Muster Point C', 'Near the main gate', 3);
