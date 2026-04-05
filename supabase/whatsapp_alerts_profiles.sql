-- Smart WhatsApp alerts: workspace owner receives lead pings via Twilio WhatsApp API.
-- Run in Supabase SQL editor after public.profiles exists.

alter table public.profiles
  add column if not exists whatsapp_alerts_enabled boolean not null default false;

alter table public.profiles
  add column if not exists whatsapp_alerts_tier text not null default 'hot';

alter table public.profiles
  add column if not exists whatsapp_alert_phone text;

alter table public.profiles drop constraint if exists profiles_whatsapp_alerts_tier_check;
alter table public.profiles
  add constraint profiles_whatsapp_alerts_tier_check
  check (whatsapp_alerts_tier in ('hot', 'warm_hot', 'all'));

comment on column public.profiles.whatsapp_alerts_enabled is 'When true and Twilio is configured, send WhatsApp alerts for new enquiries matching tier.';
comment on column public.profiles.whatsapp_alerts_tier is 'hot = Hot score only; warm_hot = Warm + Hot; all = every new enquiry.';
comment on column public.profiles.whatsapp_alert_phone is 'Owner phone for alerts, international digits (e.g. 9198xxxxxxxx). Used as whatsapp:+<digits> with Twilio.';
