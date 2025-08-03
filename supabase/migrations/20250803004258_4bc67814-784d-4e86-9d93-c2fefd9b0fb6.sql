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

-- Add more cities (5 main cities per state)
INSERT INTO public.cities (name, state) VALUES
-- São Paulo
('São Paulo', 'SP'),
('Campinas', 'SP'),
('Santos', 'SP'),
('São Bernardo do Campo', 'SP'),
('Guarulhos', 'SP'),
-- Rio de Janeiro  
('Rio de Janeiro', 'RJ'),
('Niterói', 'RJ'),
('Nova Iguaçu', 'RJ'),
('Duque de Caxias', 'RJ'),
('Campos dos Goytacazes', 'RJ'),
-- Minas Gerais
('Belo Horizonte', 'MG'),
('Uberlândia', 'MG'),
('Contagem', 'MG'),
('Juiz de Fora', 'MG'),
('Betim', 'MG'),
-- Bahia
('Salvador', 'BA'),
('Feira de Santana', 'BA'),
('Vitória da Conquista', 'BA'),
('Camaçari', 'BA'),
('Itabuna', 'BA'),
-- Paraná
('Curitiba', 'PR'),
('Londrina', 'PR'),
('Maringá', 'PR'),
('Ponta Grossa', 'PR'),
('Cascavel', 'PR'),
-- Rio Grande do Sul
('Porto Alegre', 'RS'),
('Caxias do Sul', 'RS'),
('Pelotas', 'RS'),
('Canoas', 'RS'),
('Santa Maria', 'RS'),
-- Pernambuco
('Recife', 'PE'),
('Jaboatão dos Guararapes', 'PE'),
('Olinda', 'PE'),
('Caruaru', 'PE'),
('Petrolina', 'PE'),
-- Ceará
('Fortaleza', 'CE'),
('Caucaia', 'CE'),
('Juazeiro do Norte', 'CE'),
('Maracanaú', 'CE'),
('Sobral', 'CE'),
-- Pará
('Belém', 'PA'),
('Ananindeua', 'PA'),
('Santarém', 'PA'),
('Marabá', 'PA'),
('Parauapebas', 'PA'),
-- Santa Catarina
('Florianópolis', 'SC'),
('Joinville', 'SC'),
('Blumenau', 'SC'),
('São José', 'SC'),
('Criciúma', 'SC'),
-- Goiás
('Goiânia', 'GO'),
('Aparecida de Goiânia', 'GO'),
('Anápolis', 'GO'),
('Rio Verde', 'GO'),
('Luziânia', 'GO'),
-- Maranhão
('São Luís', 'MA'),
('Imperatriz', 'MA'),
('São José de Ribamar', 'MA'),
('Timon', 'MA'),
('Caxias', 'MA'),
-- Paraíba
('João Pessoa', 'PB'),
('Campina Grande', 'PB'),
('Santa Rita', 'PB'),
('Patos', 'PB'),
('Bayeux', 'PB'),
-- Mato Grosso
('Cuiabá', 'MT'),
('Várzea Grande', 'MT'),
('Rondonópolis', 'MT'),
('Sinop', 'MT'),
('Tangará da Serra', 'MT'),
-- Espírito Santo
('Vitória', 'ES'),
('Cariacica', 'ES'),
('Cachoeiro de Itapemirim', 'ES'),
('Linhares', 'ES'),
('São Mateus', 'ES'),
-- Alagoas
('Maceió', 'AL'),
('Arapiraca', 'AL'),
('Palmeira dos Índios', 'AL'),
('Rio Largo', 'AL'),
('Penedo', 'AL'),
-- Rio Grande do Norte
('Natal', 'RN'),
('Mossoró', 'RN'),
('Parnamirim', 'RN'),
('São Gonçalo do Amarante', 'RN'),
('Macaíba', 'RN'),
-- Mato Grosso do Sul
('Campo Grande', 'MS'),
('Dourados', 'MS'),
('Três Lagoas', 'MS'),
('Corumbá', 'MS'),
('Ponta Porã', 'MS'),
-- Sergipe
('Aracaju', 'SE'),
('Nossa Senhora do Socorro', 'SE'),
('Lagarto', 'SE'),
('Itabaiana', 'SE'),
('São Cristóvão', 'SE'),
-- Rondônia
('Porto Velho', 'RO'),
('Ji-Paraná', 'RO'),
('Ariquemes', 'RO'),
('Cacoal', 'RO'),
('Vilhena', 'RO'),
-- Acre
('Rio Branco', 'AC'),
('Cruzeiro do Sul', 'AC'),
('Sena Madureira', 'AC'),
('Tarauacá', 'AC'),
('Feijó', 'AC'),
-- Amazonas
('Manaus', 'AM'),
('Parintins', 'AM'),
('Itacoatiara', 'AM'),
('Manacapuru', 'AM'),
('Coari', 'AM'),
-- Roraima
('Boa Vista', 'RR'),
('Rorainópolis', 'RR'),
('Caracaraí', 'RR'),
('Alto Alegre', 'RR'),
('Mucajaí', 'RR'),
-- Amapá
('Macapá', 'AP'),
('Santana', 'AP'),
('Laranjal do Jari', 'AP'),
('Oiapoque', 'AP'),
('Porto Grande', 'AP'),
-- Tocantins
('Palmas', 'TO'),
('Araguaína', 'TO'),
('Gurupi', 'TO'),
('Porto Nacional', 'TO'),
('Paraíso do Tocantins', 'TO'),
-- Distrito Federal
('Brasília', 'DF'),
('Taguatinga', 'DF'),
('Ceilândia', 'DF'),
('Samambaia', 'DF'),
('Planaltina', 'DF'),
-- Piauí
('Teresina', 'PI'),
('Parnaíba', 'PI'),
('Picos', 'PI'),
('Piripiri', 'PI'),
('Floriano', 'PI')
ON CONFLICT (name, state) DO NOTHING;