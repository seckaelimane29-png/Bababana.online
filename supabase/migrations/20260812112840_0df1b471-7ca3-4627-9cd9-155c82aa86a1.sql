ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'free';
ALTER TABLE public.profiles ALTER COLUMN trial_ends_at DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN trial_ends_at DROP NOT NULL;
UPDATE public.profiles SET subscription_status = 'free', trial_ends_at = NULL WHERE subscription_status = 'trial' AND subscription_plan IS NULL;