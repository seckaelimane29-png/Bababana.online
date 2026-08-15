CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

ALTER TABLE public.profiles
  ADD COLUMN subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN subscription_plan text,
  ADD COLUMN trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  ADD COLUMN subscription_start_date timestamptz,
  ADD COLUMN subscription_end_date timestamptz,
  ADD COLUMN stripe_customer_id text;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.manual_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country text NOT NULL,
  plan text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  method text NOT NULL DEFAULT 'wave',
  sender_name text,
  sender_phone text,
  screenshot_path text,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.manual_payments TO authenticated;
GRANT ALL ON public.manual_payments TO service_role;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON public.manual_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON public.manual_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.manual_payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.manual_payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_manual_payments_updated_at BEFORE UPDATE ON public.manual_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();