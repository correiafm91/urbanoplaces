
-- Adicionar coluna phone no perfil para exibir nos anúncios
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_display text;

-- Criar tabela para gerenciar anúncios salvos/favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Habilitar RLS na tabela de favoritos
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios favoritos
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários adicionarem favoritos
CREATE POLICY "Users can add favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários removerem favoritos
CREATE POLICY "Users can remove favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Adicionar campo CEP na tabela de cidades
ALTER TABLE cities ADD COLUMN IF NOT EXISTS zip_code text;

-- Criar tabela para detalhes individuais de anúncios
CREATE TABLE IF NOT EXISTS listing_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  views_count integer DEFAULT 0,
  contact_clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(listing_id)
);

-- Habilitar RLS
ALTER TABLE listing_details ENABLE ROW LEVEL SECURITY;

-- Política para visualizar detalhes de anúncios ativos
CREATE POLICY "Anyone can view listing details" ON listing_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_details.listing_id 
      AND listings.is_active = true
    )
  );

-- Política para proprietários atualizarem detalhes
CREATE POLICY "Owners can update listing details" ON listing_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_details.listing_id 
      AND listings.user_id = auth.uid()
    )
  );

-- Política para inserir detalhes
CREATE POLICY "Insert listing details" ON listing_details
  FOR INSERT WITH CHECK (true);

-- Remover limitação de anúncios grátis (tornar ilimitado)
ALTER TABLE profiles ALTER COLUMN free_ads_used SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN paid_ads_balance SET DEFAULT 999999;

-- Atualizar usuários existentes para terem anúncios ilimitados
UPDATE profiles SET paid_ads_balance = 999999 WHERE paid_ads_balance < 999999;
