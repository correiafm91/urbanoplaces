
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useChat = () => {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    checkUnreadMessages();
    
    // Configurar real-time para novas mensagens
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        checkUnreadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUnreadMessages = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Verificar se há mensagens não lidas (implementação simplificada)
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userData.user.id},seller_id.eq.${userData.user.id}`);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        
        const { data: messages } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', userData.user.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        setHasUnreadMessages((messages?.length || 0) > 0);
      }
    } catch (error) {
      console.error('Erro ao verificar mensagens:', error);
    }
  };

  return { hasUnreadMessages };
};
