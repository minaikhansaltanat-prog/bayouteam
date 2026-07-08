-- Allow Admins (not just Owner) to block/remove members, per Owner's
-- request to delegate this day-to-day moderation. Role assignment itself
-- (ТЗ 3.2: "Рөл тағайындау: Owner ✓ only") stays Owner-only.

drop policy if exists "user updates own profile" on profiles;
create policy "user updates own profile, owner/admin update anyone" on profiles
  for update using (auth.uid() = id or is_owner_or_admin())
  with check (auth.uid() = id or is_owner_or_admin());

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

  -- Admins may block/unblock, but not reassign roles.
  if is_owner_or_admin() then
    if new.role is distinct from old.role then
      raise exception 'not_allowed: only the owner can change role'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role or new.is_blocked is distinct from old.is_blocked then
    raise exception 'not_allowed: only the owner or admin can change role or block status'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
