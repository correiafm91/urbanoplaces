
-- Função para buscar ou criar uma conversa
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id uuid,
  p_buyer_id uuid,
  p_seller_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Tentar encontrar conversa existente
  SELECT id INTO conversation_id
  FROM conversations
  WHERE listing_id = p_listing_id 
    AND buyer_id = p_buyer_id;
  
  -- Se não encontrou, criar nova conversa
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (listing_id, buyer_id, seller_id)
    VALUES (p_listing_id, p_buyer_id, p_seller_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Função para buscar mensagens de uma conversa
CREATE OR REPLACE FUNCTION get_conversation_messages(p_conversation_id uuid)
RETURNS TABLE (
  id uuid,
  content text,
  filtered_content text,
  sender_id uuid,
  created_at timestamptz,
  is_filtered boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.filtered_content, m.sender_id, m.created_at, m.is_filtered
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
  ORDER BY m.created_at ASC;
END;
$$;

-- Função para enviar mensagem
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_content text,
  p_filtered_content text DEFAULT NULL,
  p_is_filtered boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO messages (conversation_id, sender_id, content, filtered_content, is_filtered)
  VALUES (p_conversation_id, p_sender_id, p_content, p_filtered_content, p_is_filtered)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;
