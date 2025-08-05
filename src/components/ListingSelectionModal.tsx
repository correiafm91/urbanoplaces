
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserListing {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

interface ListingSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingSelected: (listingId: string) => void;
  user: any;
}

export function ListingSelectionModal({ isOpen, onClose, onListingSelected, user }: ListingSelectionModalProps) {
  const [listings, setListings] = useState<UserListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchUserListings();
    }
  }, [isOpen, user]);

  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, is_active, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar seus anúncios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleContinue = () => {
    if (!selectedListing) {
      toast({
        title: "Erro",
        description: "Selecione um anúncio para destacar",
        variant: "destructive",
      });
      return;
    }
    onListingSelected(selectedListing);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Escolha o anúncio para destacar</DialogTitle>
          <DialogDescription>
            Selecione qual anúncio você deseja destacar com o plano
          </DialogDescription>
        </DialogHeader>

        {listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa ter pelo menos um anúncio ativo para usar os planos de destaque
            </p>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <RadioGroup onValueChange={setSelectedListing} value={selectedListing}>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <Label htmlFor={listing.id} className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(listing.price)} • {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="relative flex items-center">
                        <RadioGroupItem value={listing.id} id={listing.id} className="opacity-0 absolute" />
                        <div className="relative">
                          <Circle className={`w-5 h-5 ${selectedListing === listing.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          {selectedListing === listing.id && (
                            <Check className="w-3 h-3 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
