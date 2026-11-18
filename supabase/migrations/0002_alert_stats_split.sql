-- Split reach into students and guardians so "% safe" is measured against
-- students only (guardians never tap "I am Safe"), and list only students
-- in the awaiting-confirmation table.

drop function if exists public.alert_stats(uuid);

create function public.alert_stats(p_alert uuid)
returns table (students int, guardians int, safe int)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'not allowed'; end if;
  return query
  select
    (select count(*)::int from public.alerts a, public.profiles p
      where a.id = p_alert and p.role = 'student' and public.in_audience(a, p.id)),
    (select count(*)::int from public.alerts a, public.profiles p
      where a.id = p_alert and p.role = 'guardian' and public.in_audience(a, p.id)),
    (select count(*)::int from public.acknowledgements where alert_id = p_alert);
end
$$;

create or replace function public.alert_pending(p_alert uuid)
returns table (id uuid, full_name text, role public.user_role, matric_no text, phone text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'not allowed'; end if;
  return query
  select p.id, p.full_name, p.role, p.matric_no, p.phone
  from public.alerts a, public.profiles p
  where a.id = p_alert and p.role = 'student' and public.in_audience(a, p.id)
    and not exists (select 1 from public.acknowledgements k where k.alert_id = a.id and k.user_id = p.id)
  order by p.full_name
  limit 100;
end
$$;

revoke execute on function public.alert_stats(uuid) from public, anon;
grant execute on function public.alert_stats(uuid) to authenticated;
