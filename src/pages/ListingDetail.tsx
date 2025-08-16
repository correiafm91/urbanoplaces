import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft, User, MapPin, Car, Calendar, Gauge, MessageCircle } from "lucide-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CategoryBadge } from "@/components/CategoryBadge";
import { VerificationBadge } from "@/components/VerificationBadge";
import { SellerProfileModal } from "@/components/SellerProfileModal";
import { ChatModal } from "@/components/ChatModal";

interface City {
  name: string;
  state: string;
}

interface Profile {
  id: string;
  full_name: string;
  profile_photo: string | null;
  profile_completed: boolean | null;
  cpf: string | null;
  created_at: string;
}

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  brand: string;
  model: string;
  year: number;
  mileage: number | null;
  color: string | null;
  vehicle_features: string[] | null;
  other_characteristics: string[] | null;
  category: string | null;
  is_featured: boolean | null;
  user_id: string;
  profiles: Profile | null;
  cities: City | null;
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchListing();
      checkCurrentUser();
    }
  }, [id]);

  const checkCurrentUser = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setCurrentUser(userData?.user);
  };

  const fetchListing = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            id,
            full_name,
            profile_photo,
            profile_completed,
            cpf,
            created_at
          ),
          cities (
            name,
            state
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setListing(data);
      await checkFavoriteStatus();
      await incrementViews();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Anúncio não encontrado",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('listing_id', id)
        .single();

      setIsFavorited(!!data);
    } catch (error) {
      // Não é erro se não estiver favoritado
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Erro",
          description: "Faça login para favoritar anúncios",
          variant: "destructive",
        });
        return;
      }

      if (isFavorited) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('listing_id', id);
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: userData.user.id,
            listing_id: id,
          });
      }

      setIsFavorited(!isFavorited);
      toast({
        title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: isFavorited ? "Anúncio removido da sua lista" : "Anúncio salvo na sua lista",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    }
  };

  const incrementViews = async () => {
    try {
      // Incrementar visualizações
      const { data: detailsData } = await supabase
        .from('listing_details')
        .select('views_count')
        .eq('listing_id', id)
        .single();

      if (detailsData) {
        await supabase
          .from('listing_details')
          .update({ views_count: (detailsData.views_count || 0) + 1 })
          .eq('listing_id', id);
      } else {
        await supabase
          .from('listing_details')
          .insert({ listing_id: id, views_count: 1 });
      }
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOwner = currentUser && listing && currentUser.id === listing.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando anúncio...</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                <ImageCarousel images={listing.images || []} />
              </CardContent>
            </Card>

            {/* Title and Price */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryBadge category={listing.category || 'carros'} />
                      {listing.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                    className={isFavorited ? "text-red-500" : "text-muted-foreground"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                </div>
                
                <p className="text-4xl font-bold text-primary mb-4">
                  {formatPrice(listing.price)}
                </p>
                
                <p className="text-muted-foreground">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Detalhes do Veículo</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Marca</p>
                      <p className="font-medium">{listing.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Modelo</p>
                      <p className="font-medium">{listing.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ano</p>
                      <p className="font-medium">{listing.year}</p>
                    </div>
                  </div>
                  {listing.mileage && (
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Quilometragem</p>
                        <p className="font-medium">{listing.mileage.toLocaleString('pt-BR')} km</p>
                      </div>
                    </div>
                  )}
                </div>

                {listing.color && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-medium">{listing.color}</p>
                  </div>
                )}

                {listing.vehicle_features && listing.vehicle_features.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Características</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.vehicle_features.map((feature, index) => (
                        <Badge key={index} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.other_characteristics && listing.other_characteristics.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Outras características</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.other_characteristics.map((characteristic, index) => (
                        <Badge key={index} variant="outline">{characteristic}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Vendedor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {listing.profiles?.profile_photo ? (
                      <img
                        src={listing.profiles.profile_photo}
                        alt="Foto do vendedor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{listing.profiles?.full_name}</p>
                      <VerificationBadge isVerified={listing.profiles?.profile_completed || false} />
                    </div>
                    <p className="text-sm text-muted-foreground">Pessoa Física</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSellerModal(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Button>

                  {!isOwner && currentUser && (
                    <Button
                      className="w-full"
                      onClick={() => setShowChatModal(true)}
                      style={{ backgroundColor: '#FFCD44', color: 'black' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Seguro
                    </Button>
                  )}

                  {!currentUser && (
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Faça login para entrar em contato
                      </p>
                      <Link to="/auth">
                        <Button size="sm" variant="outline">Fazer Login</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Localização</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{listing.cities?.name}, {listing.cities?.state}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  🔒 Marketplace Seguro
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Use apenas o chat interno da plataforma</p>
                  <p>• Dados de contato são automaticamente ocultados</p>
                  <p>• Sempre verifique a documentação do veículo</p>
                  <p>• Prefira locais públicos para encontros</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SellerProfileModal
        isOpen={showSellerModal}
        onClose={() => setShowSellerModal(false)}
        seller={listing.profiles ? {
          ...listing.profiles,
          city: listing.cities
        } : null}
        onStartChat={() => {
          setShowSellerModal(false);
          setShowChatModal(true);
        }}
      />

      {listing && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          listingId={listing.id}
          sellerId={listing.user_id}
          listingTitle={listing.title}
        />
      )}
    </div>
  );
}
