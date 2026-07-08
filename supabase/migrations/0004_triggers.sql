-- Auth + automation triggers -------------------------------------------------

-- Block sign-in for any Gmail not on the invite list (ТЗ 4.1).
create or replace function enforce_invite_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from allowed_emails where lower(email) = lower(new.email)
  ) then
    raise exception 'not_invited: % is not on the BaYou team invite list', new.email
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger trg_enforce_invite_allowlist
  before insert on auth.users
  for each row execute function enforce_invite_allowlist();

-- Auto-create the profile row once a Google sign-in succeeds.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited role_type;
begin
  select invited_role into invited from allowed_emails where lower(email) = lower(new.email);

  insert into profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(invited, 'member')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- updated_at bookkeeping -------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function set_updated_at();
create trigger trg_projects_updated_at
  before update on projects for each row execute function set_updated_at();
create trigger trg_tasks_updated_at
  before update on tasks for each row execute function set_updated_at();

-- Defense-in-depth: only owner/admin/editor (or the assignee/helper's own
-- status+checklist+comment path handled at the application layer) may touch
-- protected task fields. Regular members are only ever offered a status
-- control in the UI, but RLS alone can't restrict individual columns —
-- this trigger enforces it at the database layer too (ТЗ 5.1: "сервер
-- деңгейіндегі қатаң шектеу").
create or replace function enforce_task_field_restrictions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if can_edit_project(new.project_id) then
    return new;
  end if;

  if new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.assignee_id is distinct from old.assignee_id
    or new.helpers is distinct from old.helpers
    or new.priority is distinct from old.priority
    or new.due_at is distinct from old.due_at
    or new.bonus_type is distinct from old.bonus_type
    or new.bonus_value is distinct from old.bonus_value
    or new.project_id is distinct from old.project_id
  then
    raise exception 'not_allowed: only editors can change this field'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trg_task_field_restrictions
  before update on tasks
  for each row execute function enforce_task_field_restrictions();

-- Only owner may change role / is_blocked on a profile, even their own.
create or replace function enforce_profile_field_restrictions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_owner() then
    return new;
  end if;

  if new.role is distinct from old.role or new.is_blocked is distinct from old.is_blocked then
    raise exception 'not_allowed: only the owner can change role or block status'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trg_profile_field_restrictions
  before update on profiles
  for each row execute function enforce_profile_field_restrictions();

-- Task chain automation (ТЗ 4.4): completing a step hands the task to the
-- next step automatically; returning a step sends it back with a reason.
create or replace function notify_user(p_user_id uuid, p_type text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  channel notification_channel;
  channels notification_channel[];
begin
  select notification_channels into channels from profiles where id = p_user_id;
  foreach channel in array coalesce(channels, '{inapp}') loop
    insert into notifications (user_id, type, channel, payload)
    values (p_user_id, p_type, channel, p_payload);
  end loop;
end;
$$;

create or replace function advance_task_chain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task tasks%rowtype;
  v_next task_chains%rowtype;
begin
  select * into v_task from tasks where id = new.task_id;

  if new.status = 'done' and old.status is distinct from 'done' then
    new.handed_at := now();

    select * into v_next from task_chains
      where task_id = new.task_id and step_order = new.step_order + 1;

    if found then
      update task_chains set status = 'active' where id = v_next.id;
      update tasks
        set assignee_id = v_next.user_id, status = 'todo'
        where id = new.task_id;

      insert into task_events (task_id, user_id, event_type, payload)
      values (new.task_id, auth.uid(), 'chain_advance',
        jsonb_build_object('from', new.user_id, 'to', v_next.user_id, 'step', v_next.step_order));

      perform notify_user(v_next.user_id, 'chain_moved',
        jsonb_build_object('task_id', new.task_id, 'task_title', v_task.title));
    else
      update tasks set status = 'done' where id = new.task_id;
      insert into task_events (task_id, user_id, event_type, payload)
      values (new.task_id, auth.uid(), 'status_change', jsonb_build_object('status', 'done'));
    end if;
  end if;

  if new.status = 'returned' and old.status is distinct from 'returned' then
    select * into v_next from task_chains
      where task_id = new.task_id and step_order = new.step_order - 1;

    if found then
      update task_chains set status = 'active' where id = v_next.id;
      update tasks
        set assignee_id = v_next.user_id, status = 'in_review'
        where id = new.task_id;

      insert into task_events (task_id, user_id, event_type, payload)
      values (new.task_id, auth.uid(), 'return',
        jsonb_build_object('from', new.user_id, 'to', v_next.user_id, 'reason', new.returned_reason));

      perform notify_user(v_next.user_id, 'task_returned',
        jsonb_build_object('task_id', new.task_id, 'task_title', v_task.title, 'reason', new.returned_reason));
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_advance_task_chain
  before update on task_chains
  for each row execute function advance_task_chain();

-- Notify the assignee whenever a task is (re)assigned to them.
create or replace function notify_on_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null and new.assignee_id is distinct from old.assignee_id then
    perform notify_user(new.assignee_id, 'task_assigned',
      jsonb_build_object('task_id', new.id, 'task_title', new.title));
  end if;
  return new;
end;
$$;

create trigger trg_notify_on_assignment
  after update on tasks
  for each row execute function notify_on_assignment();

create or replace function notify_on_task_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null then
    perform notify_user(new.assignee_id, 'task_assigned',
      jsonb_build_object('task_id', new.id, 'task_title', new.title));
  end if;
  insert into task_events (task_id, user_id, event_type, payload)
  values (new.id, new.created_by, 'create', jsonb_build_object('title', new.title));
  return new;
end;
$$;

create trigger trg_notify_on_task_insert
  after insert on tasks
  for each row execute function notify_on_task_insert();

-- Public share-link resolution (bypasses RLS safely, checked here). ------------
create or replace function resolve_share_link(p_token text, p_password text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  link share_links%rowtype;
begin
  select * into link from share_links where token = p_token and not revoked;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  if link.expires_at is not null and link.expires_at < now() then
    return jsonb_build_object('error', 'expired');
  end if;

  if link.password_hash is not null
    and link.password_hash is distinct from crypt(coalesce(p_password, ''), link.password_hash) then
    return jsonb_build_object('error', 'password_required');
  end if;

  insert into share_events (link_id, channel) values (link.id, 'web');

  return jsonb_build_object(
    'resource_type', link.resource_type,
    'resource_id', link.resource_id,
    'mode', link.mode
  );
end;
$$;
