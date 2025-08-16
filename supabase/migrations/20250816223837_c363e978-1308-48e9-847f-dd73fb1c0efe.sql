
-- 1) Remover campos de contato do perfil (telefone, WhatsApp, Instagram) e CNPJ/razão social
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS phone_display,
DROP COLUMN IF EXISTS whatsapp,
DROP COLUMN IF EXISTS instagram,
DROP COLUMN IF EXISTS cnpj,
DROP COLUMN IF EXISTS razao_social;

-- Forçar apenas pessoa física
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'pf';
UPDATE public.profiles SET user_type = 'pf' WHERE user_type IS NULL OR user_type = 'pj';

-- 2) Criar tabela de conversas do chat
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

-- 3) Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  filtered_content text,
  is_filtered boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Habilitar RLS e políticas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'Users can view conversations they participate in'
  ) THEN
    CREATE POLICY "Users can view conversations they participate in"
      ON public.conversations
      FOR SELECT
      USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'Buyers can create conversations'
  ) THEN
    CREATE POLICY "Buyers can create conversations"
      ON public.conversations
      FOR INSERT
      WITH CHECK (auth.uid() = buyer_id);
  END IF;
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can view messages in their conversations'
  ) THEN
    CREATE POLICY "Users can view messages in their conversations"
      ON public.messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.conversations c 
          WHERE c.id = conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can send messages in their conversations'
  ) THEN
    CREATE POLICY "Users can send messages in their conversations"
      ON public.messages
      FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
          SELECT 1 FROM public.conversations c 
          WHERE c.id = conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
      );
  END IF;
END $$;

-- 5) Trigger para manter updated_at em conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
