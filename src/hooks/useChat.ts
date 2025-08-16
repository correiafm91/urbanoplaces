
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  filtered_content?: string;
  sender_id: string;
  created_at: string;
  is_filtered: boolean;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export const useChat = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data: messages, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversationId
      });

      if (error) throw error;
      setMessages(messages || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (content: string, senderId: string) => {
    if (!conversationId) return;

    try {
      const { error } = await supabase.rpc('send_message', {
        p_conversation_id: conversationId,
        p_sender_id: senderId,
        p_content: content
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
