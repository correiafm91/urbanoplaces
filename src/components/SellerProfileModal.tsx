
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, Star, MessageCircle } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";

interface SellerProfile {
  id: string;
  full_name: string;
  user_type?: string;
  profile_photo?: string;
  profile_completed?: boolean;
  cpf?: string;
  city?: {
    name: string;
    state: string;
  };
  created_at?: string;
}

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerProfile | null;
  onStartChat?: () => void;
}

export function SellerProfileModal({ 
  isOpen, 
  onClose, 
  seller, 
  onStartChat 
}: SellerProfileModalProps) {
  if (!seller) return null;

  const maskCPF = (cpf?: string) => {
    if (!cpf) return 'Não informado';
    // Mostra apenas os 3 primeiros e 2 últimos dígitos
    return cpf.replace(/(\d{3})\d{5}(\d{2})/, '$1.***.**-$2');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Perfil do Vendedor</DialogTitle>
          <DialogDescription>
            Informações sobre o anunciante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {seller.profile_photo ? (
                <img
                  src={seller.profile_photo}
                  alt="Foto do vendedor"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{seller.full_name}</h3>
                <VerificationBadge isVerified={seller.profile_completed || false} />
              </div>
              <p className="text-sm text-muted-foreground">Pessoa Física</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>CPF: {maskCPF(seller.cpf)}</span>
            </div>

            {seller.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{seller.city.name}, {seller.city.state}</span>
              </div>
            )}

            {seller.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Membro desde {new Date(seller.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span>
                {seller.profile_completed ? 'Perfil verificado' : 'Perfil não verificado'}
              </span>
            </div>
          </div>

          {/* Chat Action */}
          <div className="space-y-3">
            <h4 className="font-medium">Entrar em contato</h4>
            
            {onStartChat && (
              <Button
                className="w-full"
                onClick={onStartChat}
                style={{ backgroundColor: '#FFCD44', color: 'black' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Iniciar Chat Seguro
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 text-sm text-blue-900">🔒 Chat Seguro</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Todas as conversas são protegidas</li>
              <li>• Dados de contato são automaticamente ocultados</li>
              <li>• Negocie com segurança através do chat interno</li>
              <li>• Sempre verifique a documentação do veículo</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
