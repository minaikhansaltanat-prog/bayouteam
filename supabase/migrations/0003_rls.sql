-- Row-Level Security — every table is locked down server-side.
-- "клиент жағындағы жасыру емес, сервер деңгейіндегі қатаң шектеу" (ТЗ 5.1)

alter table allowed_emails enable row level security;
alter table profiles enable row level security;
alter table member_limits enable row level security;
alter table delegated_permissions enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table task_chains enable row level security;
alter table task_events enable row level security;
alter table meetings enable row level security;
alter table files enable row level security;
alter table file_permissions enable row level security;
alter table share_links enable row level security;
alter table share_events enable row level security;
alter table notifications enable row level security;
alter table bonuses enable row level security;
alter table audit_log enable row level security;
alter table contracts_analysis enable row level security;

-- allowed_emails ---------------------------------------------------------
create policy "owner manages invite list" on allowed_emails
  for all using (is_owner_or_admin()) with check (is_owner_or_admin());

-- profiles -----------------------------------------------------------------
create policy "authenticated users read all profiles" on profiles
  for select using (auth.uid() is not null);

create policy "user updates own profile" on profiles
  for update using (auth.uid() = id or is_owner())
  with check (auth.uid() = id or is_owner());

-- member_limits (hidden even from the member themselves) -------------------
create policy "owner only reads limits" on member_limits
  for select using (is_owner());
create policy "owner only writes limits" on member_limits
  for all using (is_owner()) with check (is_owner());

-- delegated_permissions ------------------------------------------------------
create policy "owner and self read delegation" on delegated_permissions
  for select using (is_owner() or user_id = auth.uid());
create policy "owner manages delegation" on delegated_permissions
  for insert with check (is_owner());
create policy "owner updates delegation" on delegated_permissions
  for update using (is_owner()) with check (is_owner());
create policy "owner deletes delegation" on delegated_permissions
  for delete using (is_owner());

-- projects -------------------------------------------------------------------
create policy "members see their projects" on projects
  for select using (can_see_project(id));
create policy "owner/admin create projects" on projects
  for insert with check (is_owner_or_admin());
create policy "editors update projects" on projects
  for update using (can_edit_project(id)) with check (can_edit_project(id));

-- project_members -------------------------------------------------------------
create policy "members see project roster" on project_members
  for select using (can_see_project(project_id));
create policy "editors add project members" on project_members
  for insert with check (can_edit_project(project_id));
create policy "editors change member roles" on project_members
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "editors remove project members" on project_members
  for delete using (can_edit_project(project_id));

-- tasks -------------------------------------------------------------------------
create policy "members see project tasks" on tasks
  for select using (can_see_project(project_id));
create policy "editors create tasks" on tasks
  for insert with check (can_edit_project(project_id));
create policy "editors and assignees update tasks" on tasks
  for update using (
    can_edit_project(project_id)
    or auth.uid() = assignee_id
    or auth.uid() = any(helpers)
  )
  with check (
    can_edit_project(project_id)
    or auth.uid() = assignee_id
    or auth.uid() = any(helpers)
  );

-- task_chains ---------------------------------------------------------------------
create policy "members see task chain" on task_chains
  for select using (can_see_project(project_of_task(task_id)));
create policy "editors build task chain" on task_chains
  for insert with check (can_edit_project(project_of_task(task_id)));
create policy "editors or current holder update chain step" on task_chains
  for update using (
    can_edit_project(project_of_task(task_id)) or auth.uid() = user_id
  )
  with check (
    can_edit_project(project_of_task(task_id)) or auth.uid() = user_id
  );
create policy "editors delete chain step" on task_chains
  for delete using (can_edit_project(project_of_task(task_id)));

-- task_events (comments / immutable history) -----------------------------------------
create policy "members see task history" on task_events
  for select using (can_see_project(project_of_task(task_id)));
create policy "members log task events" on task_events
  for insert with check (can_see_project(project_of_task(task_id)));

-- meetings --------------------------------------------------------------------------
create policy "members see meetings" on meetings
  for select using (can_see_project(project_id));
create policy "editors manage meetings" on meetings
  for insert with check (can_edit_project(project_id));
create policy "editors update meetings" on meetings
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "editors delete meetings" on meetings
  for delete using (can_edit_project(project_id));

-- files -------------------------------------------------------------------------------
create policy "scoped file visibility" on files
  for select using (
    case
      when is_contract then (
        owner_id = auth.uid()
        or is_owner_or_admin()
        or exists (
          select 1 from file_permissions
          where file_id = files.id and user_id = auth.uid() and can_view
        )
      )
      when scope = 'workspace' then auth.uid() is not null
      when scope = 'project' then can_see_project(scope_id)
      when scope = 'task' then can_see_project(project_of_task(scope_id))
      else false
    end
  );
create policy "members upload files" on files
  for insert with check (
    case
      when scope = 'workspace' then is_owner_or_admin()
      when scope = 'project' then is_project_member(scope_id) or is_owner_or_admin()
      when scope = 'task' then can_see_project(project_of_task(scope_id))
      else false
    end
  );
create policy "owner of file or admin can update" on files
  for update using (owner_id = auth.uid() or is_owner_or_admin());
create policy "owner of file or admin can delete" on files
  for delete using (owner_id = auth.uid() or is_owner_or_admin());

-- file_permissions --------------------------------------------------------------------
create policy "grantees and admins read permissions" on file_permissions
  for select using (
    user_id = auth.uid() or is_owner_or_admin() or has_delegation('can_grant_file_access')
  );
create policy "admins grant file access" on file_permissions
  for insert with check (is_owner_or_admin() or has_delegation('can_grant_file_access'));
create policy "admins update file access" on file_permissions
  for update using (is_owner_or_admin() or has_delegation('can_grant_file_access'));
create policy "admins revoke file access" on file_permissions
  for delete using (is_owner_or_admin() or has_delegation('can_grant_file_access'));

-- share_links --------------------------------------------------------------------------
create policy "creator and admins see share links" on share_links
  for select using (created_by = auth.uid() or is_owner_or_admin());
create policy "delegated users create share links" on share_links
  for insert with check (is_owner_or_admin() or has_delegation('can_create_share_links'));
create policy "creator and admins revoke share links" on share_links
  for update using (created_by = auth.uid() or is_owner_or_admin());

-- share_events (written only via record_share_open() SECURITY DEFINER function) --------
create policy "creator and admins read share events" on share_events
  for select using (
    exists (
      select 1 from share_links
      where id = link_id and (created_by = auth.uid() or is_owner_or_admin())
    )
  );

-- notifications ---------------------------------------------------------------------------
create policy "user reads own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "user marks own notifications read" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- bonuses -----------------------------------------------------------------------------------
create policy "recipient and admins see bonuses" on bonuses
  for select using (
    user_id = auth.uid() or is_owner_or_admin() or has_delegation('can_manage_bonuses')
  );
create policy "delegated users set bonuses" on bonuses
  for insert with check (is_owner_or_admin() or has_delegation('can_manage_bonuses'));
create policy "delegated users update bonuses" on bonuses
  for update using (is_owner_or_admin() or has_delegation('can_manage_bonuses'));

-- audit_log (append-only) -------------------------------------------------------------------
create policy "owner/admin read audit log" on audit_log
  for select using (is_owner_or_admin());
create policy "authenticated users append own audit entries" on audit_log
  for insert with check (user_id = auth.uid());

-- contracts_analysis ------------------------------------------------------------------------
create policy "owner and subject read contract analysis" on contracts_analysis
  for select using (user_id = auth.uid() or is_owner_or_admin());
create policy "owner writes contract analysis" on contracts_analysis
  for insert with check (is_owner_or_admin());
