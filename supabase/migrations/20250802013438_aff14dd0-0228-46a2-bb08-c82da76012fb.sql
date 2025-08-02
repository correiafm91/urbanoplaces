-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  city_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cities table for Brazilian cities
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create motorcycle listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  color TEXT,
  city_id UUID NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create foreign key relationships
ALTER TABLE public.profiles ADD FOREIGN KEY (city_id) REFERENCES public.cities(id);
ALTER TABLE public.listings ADD FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.listings ADD FOREIGN KEY (city_id) REFERENCES public.cities(id);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for cities (public read access)
CREATE POLICY "Cities are viewable by everyone" 
ON public.cities 
FOR SELECT 
USING (true);

-- Create policies for listings
CREATE POLICY "Anyone can view active listings" 
ON public.listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
  AND user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (
  user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own listings" 
ON public.listings 
FOR DELETE 
USING (
  user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some Brazilian cities
INSERT INTO public.cities (name, state) VALUES
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Brasília', 'DF'),
('Salvador', 'BA'),
('Fortaleza', 'CE'),
('Curitiba', 'PR'),
('Recife', 'PE'),
('Porto Alegre', 'RS'),
('Manaus', 'AM'),
('Goiânia', 'GO'),
('Belém', 'PA'),
('Guarulhos', 'SP'),
('Campinas', 'SP'),
('São Luís', 'MA'),
('Maceió', 'AL'),
('Duque de Caxias', 'RJ'),
('Natal', 'RN'),
('Teresina', 'PI'),
('São Bernardo do Campo', 'SP'),
('Campo Grande', 'MS'),
('João Pessoa', 'PB'),
('Osasco', 'SP'),
('Santo André', 'SP'),
('Jaboatão dos Guararapes', 'PE');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();