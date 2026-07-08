-- Bootstrap: invite the Owner so the very first Google sign-in succeeds.
-- Add teammates later from /admin (writes to allowed_emails).

insert into allowed_emails (email, invited_role)
values ('minaikhan.saltanat@gmail.com', 'owner')
on conflict (email) do update set invited_role = 'owner';
