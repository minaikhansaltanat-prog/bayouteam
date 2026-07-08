-- BaYou team — core schema
-- Matches Техникалық тапсырма v1.0, section 6.2

create extension if not exists "pgcrypto";

create type role_type as enum ('owner', 'admin', 'editor', 'member', 'guest');
create type task_status as enum ('todo', 'in_progress', 'in_review', 'done');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type plan_scope_type as enum ('day', 'week', 'month');
create type bonus_type as enum ('money', 'gift', 'points', 'text');
create type bonus_status as enum ('pending', 'awarded');
create type file_scope as enum ('workspace', 'project', 'task');
create type share_mode as enum ('view', 'comment');
create type notification_channel as enum ('email', 'whatsapp', 'inapp');
create type project_status as enum ('active', 'on_hold', 'completed');
create type chain_step_status as enum ('pending', 'active', 'done', 'returned');
create type task_event_type as enum (
  'status_change', 'return', 'comment', 'assign', 'chain_advance', 'attachment', 'create'
);

-- Invite allowlist: only these emails may complete Google sign-in.
create table allowed_emails (
  email text primary key,
  invited_role role_type not null default 'member',
  invited_by uuid,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  phone_whatsapp text,
  position text,
  skills text[] not null default '{}',
  role role_type not null default 'member',
  locale text not null default 'kk' check (locale in ('kk', 'ru')),
  is_blocked boolean not null default false,
  notification_channels notification_channel[] not null default '{email,inapp}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Owner-only, hidden from the member themselves (ТЗ 4.10: "Лимит мүшеге көрінбейді").
create table member_limits (
  user_id uuid primary key references profiles on delete cascade,
  error_limit int,
  error_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- Delegatable Owner-only rights (ТЗ 3.2 matrix, "*" rows).
create table delegated_permissions (
  user_id uuid primary key references profiles on delete cascade,
  can_manage_bonuses boolean not null default false,
  can_view_analytics boolean not null default false,
  can_grant_file_access boolean not null default false,
  can_create_share_links boolean not null default false,
  can_export_all boolean not null default false,
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text,
  website text,
  goal text,
  deadline date,
  status project_status not null default 'active',
  created_by uuid references profiles,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_members (
  project_id uuid references projects on delete cascade,
  user_id uuid references profiles on delete cascade,
  role_in_project role_type not null default 'member',
  added_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  description text,
  audio_url text,
  transcript text,
  assignee_id uuid references profiles,
  helpers uuid[] not null default '{}',
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  color text,
  plan_scope plan_scope_type,
  due_at timestamptz,
  bonus_type bonus_type,
  bonus_value text,
  checklist jsonb not null default '[]',
  tags text[] not null default '{}',
  created_by uuid references profiles,
  position int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_chains (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks on delete cascade,
  step_order int not null,
  user_id uuid not null references profiles,
  description text,
  step_deadline timestamptz,
  status chain_step_status not null default 'pending',
  handed_at timestamptz,
  returned_reason text,
  unique (task_id, step_order)
);

create table task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks on delete cascade,
  user_id uuid references profiles,
  event_type task_event_type not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  date timestamptz not null default now(),
  secretary_id uuid references profiles,
  agenda text,
  decisions jsonb not null default '[]',
  participants uuid[] not null default '{}',
  created_by uuid references profiles,
  created_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  scope file_scope not null,
  scope_id uuid,
  owner_id uuid references profiles,
  name text not null,
  storage_path text not null,
  mime text,
  size bigint not null default 0,
  is_contract boolean not null default false,
  created_at timestamptz not null default now()
);

create table file_permissions (
  file_id uuid references files on delete cascade,
  user_id uuid references profiles on delete cascade,
  can_view boolean not null default true,
  can_download boolean not null default true,
  granted_by uuid references profiles,
  granted_at timestamptz not null default now(),
  primary key (file_id, user_id)
);

create table share_links (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('task', 'project', 'meeting')),
  resource_id uuid not null,
  token text not null unique default encode(gen_random_bytes(24), 'base64url'),
  mode share_mode not null default 'view',
  expires_at timestamptz,
  password_hash text,
  created_by uuid references profiles,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table share_events (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references share_links on delete cascade,
  opened_by text,
  channel text,
  ip text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  type text not null,
  channel notification_channel not null,
  payload jsonb not null default '{}',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table bonuses (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks on delete cascade,
  user_id uuid not null references profiles,
  type bonus_type not null,
  value text not null,
  status bonus_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  action text not null,
  resource text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table contracts_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles,
  contract_file_id uuid references files,
  report jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_tasks_project on tasks (project_id) where deleted_at is null;
create index idx_tasks_assignee on tasks (assignee_id) where deleted_at is null;
create index idx_tasks_due on tasks (due_at) where deleted_at is null;
create index idx_task_events_task on task_events (task_id, created_at desc);
create index idx_task_chains_task on task_chains (task_id, step_order);
create index idx_files_scope on files (scope, scope_id);
create index idx_notifications_user on notifications (user_id, read_at);
create index idx_project_members_user on project_members (user_id);
create index idx_meetings_project on meetings (project_id, date desc);
create index idx_audit_log_created on audit_log (created_at desc);

alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table task_events;
alter publication supabase_realtime add table task_chains;
alter publication supabase_realtime add table notifications;
