-- Run once in the Supabase SQL editor.
-- One reminder email per Discord server, saved by the website's billing function (service role only).

create table if not exists disconotify.notify_contact_emails (
  guild_id        bigint primary key,
  email           text not null,
  discord_user_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Private: no policy means only the service-role key can read or write it.
alter table disconotify.notify_contact_emails enable row level security;

-- To send reminders by hand, e.g. servers whose access ends soon:
--   select c.email, b.guild_id, b.paid_until, b.trial_ends_at
--   from disconotify.notify_contact_emails c
--   join disconotify.notify_billing b using (guild_id)
--   order by coalesce(b.paid_until, b.trial_ends_at);
