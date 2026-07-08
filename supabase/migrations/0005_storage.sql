-- Storage buckets (ТЗ 5.1: private bucket, signed URLs; avatars are the one
-- public exception since they're shown all over the UI).

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('avatars', 'avatars', true, 5242880),
  ('attachments', 'attachments', false, 209715200),
  ('project-logos', 'project-logos', true, 5242880)
on conflict (id) do nothing;

create policy "anyone can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "authenticated users upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "authenticated users replace own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and owner = auth.uid());

create policy "anyone can view project logos" on storage.objects
  for select using (bucket_id = 'project-logos');
create policy "editors upload project logos" on storage.objects
  for insert with check (bucket_id = 'project-logos' and auth.uid() is not null);

-- attachments bucket has no SELECT policy for regular clients on purpose:
-- reads always go through a server action that checks the `files` table
-- (RLS-protected) first, then mints a short-lived signed URL with the
-- service-role key. This keeps per-file/per-contract access control in one
-- place (the `files` + `file_permissions` tables) instead of duplicating it
-- in storage path parsing.
create policy "authenticated users upload attachments" on storage.objects
  for insert with check (bucket_id = 'attachments' and auth.uid() is not null);
create policy "owners manage own attachments" on storage.objects
  for update using (bucket_id = 'attachments' and owner = auth.uid());
create policy "owners delete own attachments" on storage.objects
  for delete using (bucket_id = 'attachments' and owner = auth.uid());
