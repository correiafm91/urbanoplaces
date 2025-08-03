-- Add verification and plan columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_verified boolean DEFAULT false,
ADD COLUMN user_type text CHECK (user_type IN ('pf', 'pj')),
ADD COLUMN cpf text,
ADD COLUMN cnpj text,
ADD COLUMN razao_social text,
ADD COLUMN instagram text,
ADD COLUMN free_ads_used integer DEFAULT 0,
ADD COLUMN paid_ads_balance integer DEFAULT 0;

-- Create plans table
CREATE TABLE public.plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('prata', 'ouro', 'diamante', 'pacote_anuncios')),
  price numeric NOT NULL,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plans
CREATE POLICY "Users can view their own plans" 
ON public.plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
ON public.plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add plan_id to listings table to track which plan was used
ALTER TABLE public.listings 
ADD COLUMN plan_id uuid REFERENCES public.plans(id),
ADD COLUMN expires_at timestamp with time zone DEFAULT (now() + interval '60 days'),
ADD COLUMN is_featured boolean DEFAULT false;

-- Create saved_listings table
CREATE TABLE public.saved_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS on saved_listings
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_listings
CREATE POLICY "Users can view their own saved listings" 
ON public.saved_listings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings" 
ON public.saved_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved listings" 
ON public.saved_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for plans updated_at
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();