
-- Adicionar nova coluna category na tabela listings
ALTER TABLE public.listings ADD COLUMN category TEXT DEFAULT 'carros' CHECK (category IN ('carros', 'motos', 'vans', 'barcos', 'outros'));

-- Adicionar colunas para foto de perfil e informações completas na tabela profiles
ALTER TABLE public.profiles ADD COLUMN profile_photo TEXT;
ALTER TABLE public.profiles ADD COLUMN profile_completed BOOLEAN DEFAULT false;

-- Criar função para verificar se o perfil está completo
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se os campos obrigatórios estão preenchidos
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' AND
     NEW.phone IS NOT NULL AND NEW.phone != '' AND
     NEW.city_id IS NOT NULL THEN
    NEW.profile_completed = true;
  ELSE
    NEW.profile_completed = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente o status de perfil completo
CREATE TRIGGER update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_completion();

-- Atualizar profiles existentes
UPDATE public.profiles 
SET profile_completed = (
  full_name IS NOT NULL AND full_name != '' AND
  phone IS NOT NULL AND phone != '' AND
  city_id IS NOT NULL
);
