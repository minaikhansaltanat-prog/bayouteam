-- Helper functions used by RLS policies below.
-- security definer + stable so they can be called cheaply inside policies
-- without re-triggering RLS recursion on `profiles`.

create or replace function auth_role()
returns role_type
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(auth_role() = 'owner', false);
$$;

create or replace function is_owner_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(auth_role() in ('owner', 'admin'), false);
$$;

create or replace function is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

create or replace function project_role(p_project_id uuid)
returns role_type
language sql
security definer
stable
set search_path = public
as $$
  select role_in_project from project_members
  where project_id = p_project_id and user_id = auth.uid();
$$;

create or replace function can_edit_project(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select is_owner_or_admin()
    or project_role(p_project_id) in ('owner', 'admin', 'editor');
$$;

create or replace function can_see_project(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select is_owner_or_admin() or is_project_member(p_project_id);
$$;

create or replace function project_of_task(p_task_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select project_id from tasks where id = p_task_id;
$$;

create or replace function has_delegation(p_flag text)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  result boolean;
begin
  if is_owner() then
    return true;
  end if;
  execute format(
    'select %I from delegated_permissions where user_id = $1', p_flag
  ) into result using auth.uid();
  return coalesce(result, false);
end;
$$;

create or replace function log_audit(p_action text, p_resource text, p_details jsonb default '{}')
returns void
language sql
security definer
set search_path = public
as $$
  insert into audit_log (user_id, action, resource, details)
  values (auth.uid(), p_action, p_resource, p_details);
$$;
