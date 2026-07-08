-- Helper so the client never has to bcrypt-hash passwords itself.
create or replace function crypt_password(plain text)
returns text
language sql
security definer
set search_path = public
as $$
  select crypt(plain, gen_salt('bf'));
$$;

grant execute on function crypt_password(text) to authenticated;
