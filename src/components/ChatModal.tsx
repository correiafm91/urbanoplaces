
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { filterContactInfo } from "@/utils/messageFilter";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

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
  messages: Message[];
}

export function ChatModal({
  isOpen,
  onClose,
  listingId,
  sellerId,
  listingTitle,
}: ChatModalProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, listingId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      setCurrentUserId(userData.user.id);

      // Verificar se já existe uma conversa
      let { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', userData.user.id)
        .single();

      if (!existingConversation) {
        // Criar nova conversa
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: userData.user.id,
            seller_id: sellerId,
          })
          .select()
          .single();

        if (error) throw error;
        existingConversation = newConversation;
      }

      await loadMessages(existingConversation.id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao inicializar chat",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setConversation({
        id: conversationId,
        messages: messages || [],
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    try {
      setLoading(true);

      // Filtrar a mensagem
      const { filtered, isFiltered } = filterContactInfo(newMessage);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: newMessage,
          filtered_content: isFiltered ? filtered : null,
          is_filtered: isFiltered,
        });

      if (error) throw error;

      if (isFiltered) {
        toast({
          title: "Mensagem filtrada",
          description: "Dados de contato foram ocultados para sua segurança",
          variant: "destructive",
        });
      }

      setNewMessage("");
      await loadMessages(conversation.id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat Seguro
          </DialogTitle>
          <DialogDescription>
            Conversando sobre: {listingTitle}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-lg">
          <div className="space-y-4">
            {conversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">
                    {message.is_filtered ? message.filtered_content : message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                  {message.is_filtered && (
                    <p className="text-xs opacity-70 mt-1 italic">
                      ⚠️ Mensagem filtrada por segurança
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
          🔒 <strong>Chat Seguro:</strong> Todos os dados de contato são automaticamente ocultados.
          Use apenas este chat para negociar com segurança.
        </div>
      </DialogContent>
    </Dialog>
  );
}
