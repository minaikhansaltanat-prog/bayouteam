-- Allow Owner and Admin to prune audit_log entries from the UI.
-- (Deliberately not delegatable beyond that — see ТЗ 5.1: the log exists
-- as a neutral record, so only the two most-trusted roles may clear it.)
create policy "owner/admin delete audit log entries" on audit_log
  for delete using (is_owner_or_admin());
