ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grace_ends_at timestamp with time zone;

UPDATE public.profiles
SET grace_ends_at = COALESCE(subscription_end_date, trial_ends_at) + interval '24 hours'
WHERE grace_ends_at IS NULL
  AND COALESCE(subscription_end_date, trial_ends_at) IS NOT NULL;