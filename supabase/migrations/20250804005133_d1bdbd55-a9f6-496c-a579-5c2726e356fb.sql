
-- Create categories table for vehicle types
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
  ('carros'),
  ('motos'),
  ('vans'),
  ('barcos'),
  ('outros');

-- Enable RLS for categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view categories
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories 
  FOR SELECT 
  USING (true);
