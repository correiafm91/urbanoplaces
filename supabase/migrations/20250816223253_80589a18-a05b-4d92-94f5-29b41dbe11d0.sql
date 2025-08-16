
-- Remover campos de contato desnecessários da tabela profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS phone_display,
DROP COLUMN IF EXISTS whatsapp,
DROP COLUMN IF EXISTS instagram,
DROP COLUMN IF EXISTS cnpj,
DROP COLUMN IF EXISTS razao_social;

-- Forçar user_type para 'pf' (pessoa física) apenas
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'pf';

-- Atualizar registros existentes para serem pessoa física
UPDATE public.profiles SET user_type = 'pf' WHERE user_type IS NULL OR user_type = 'pj';

-- Criar tabela para conversas do chat
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id)
);

-- Criar tabela para mensagens do chat
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  filtered_content text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_filtered boolean DEFAULT false
);

-- RLS para conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

-- RLS para messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Trigger para atualizar updated_at em conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
