
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, MessageCircle, Instagram, MapPin, Calendar, Star } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";

interface SellerProfile {
  id: string;
  full_name: string;
  phone_display?: string;
  user_type?: string;
  razao_social?: string;
  profile_photo?: string;
  profile_completed?: boolean;
  whatsapp?: string;
  instagram?: string;
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
}

export function SellerProfileModal({ isOpen, onClose, seller }: SellerProfileModalProps) {
  if (!seller) return null;

  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const getDisplayName = () => {
    return seller.user_type === 'pj' ? seller.razao_social : seller.full_name;
  };

  const getUserType = () => {
    return seller.user_type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física';
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
                <h3 className="font-semibold text-lg">{getDisplayName()}</h3>
                <VerificationBadge isVerified={seller.profile_completed || false} />
              </div>
              <p className="text-sm text-muted-foreground">{getUserType()}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
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

          {/* Contact Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Entrar em contato</h4>
            
            {seller.phone_display && (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => window.location.href = `tel:${seller.phone_display}`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {seller.phone_display}
                </Button>
                
                <Button
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    window.open(`https://wa.me/55${formatPhoneForWhatsApp(seller.phone_display)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            )}

            {seller.instagram && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const username = seller.instagram?.replace('@', '');
                  window.open(`https://instagram.com/${username}`, '_blank');
                }}
              >
                <Instagram className="w-4 h-4 mr-2" />
                {seller.instagram}
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Dicas de Segurança</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Sempre negocie pessoalmente</li>
              <li>• Verifique a documentação do veículo</li>
              <li>• Desconfie de preços muito baixos</li>
              <li>• Prefira locais públicos para encontros</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
