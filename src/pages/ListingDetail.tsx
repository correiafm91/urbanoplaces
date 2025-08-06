import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar, Gauge, Phone, MessageCircle, Eye, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CategoryBadge } from "@/components/CategoryBadge";
import { VerificationBadge } from "@/components/VerificationBadge";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  color?: string;
  images: string[];
  category: string;
  city: {
    name: string;
    state: string;
    zip_code?: string;
  };
  created_at: string;
  is_featured: boolean;
  plan_id?: string;
  profiles: {
    id: string;
    full_name: string;
    phone_display?: string;
    user_type?: string;
    razao_social?: string;
    profile_photo?: string;
    profile_completed?: boolean;
  };
  plans?: {
    plan_type: string;
  };
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchListing();
      incrementViews();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          city:cities(name, state, zip_code),
          profiles!inner(id, full_name, phone_display, user_type, razao_social, profile_photo, profile_completed),
          plans(plan_type)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }
      
      setListing(data);

      // Check if user has favorited this listing
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: favorite } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('listing_id', id)
          .single();
        
        setIsFavorite(!!favorite);
      }
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Erro",
        description: "Anúncio não encontrado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { data: existingDetails } = await supabase
        .from('listing_details')
        .select('views_count')
        .eq('listing_id', id)
        .single();

      if (existingDetails) {
        await supabase
          .from('listing_details')
          .update({ 
            views_count: (existingDetails.views_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('listing_id', id);
      } else {
        await supabase
          .from('listing_details')
          .insert({
            listing_id: id,
            views_count: 1
          });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        toast({
          title: "Login necessário",
          description: "Faça login para salvar anúncios",
          variant: "destructive",
        });
        return;
      }

      if (isFavorite) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.user.id)
          .eq('listing_id', id);
        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos",
        });
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.user.id,
            listing_id: id
          });
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleContactClick = async () => {
    try {
      const { data: existingDetails } = await supabase
        .from('listing_details')
        .select('contact_clicks')
        .eq('listing_id', id)
        .single();

      if (existingDetails) {
        await supabase
          .from('listing_details')
          .update({ 
            contact_clicks: (existingDetails.contact_clicks || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('listing_id', id);
      } else {
        await supabase
          .from('listing_details')
          .insert({
            listing_id: id,
            contact_clicks: 1
          });
      }
    } catch (error) {
      console.error('Error updating contact clicks:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "Não informado";
    return `${mileage.toLocaleString('pt-BR')} km`;
  };

  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const viewSellerProfile = () => {
    setShowSellerModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-64 mb-6"></div>
            <div className="bg-muted rounded h-8 w-3/4 mb-4"></div>
            <div className="bg-muted rounded h-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative">
              <ImageCarousel
                images={listing.images || []}
                title={listing.title}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
              />
              
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                onClick={toggleFavorite}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={listing.category} />
                <Badge variant="secondary" className="text-xs">
                  {listing.brand} {listing.model}
                </Badge>
                <span className="text-sm text-muted-foreground">{listing.year}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="text-4xl font-bold mb-4">
                {formatPrice(listing.price)}
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div>{listing.city.name}, {listing.city.state}</div>
                      {listing.city.zip_code && (
                        <div className="text-xs text-muted-foreground">CEP: {listing.city.zip_code}</div>
                      )}
                    </div>
                  </div>
                  
                  {listing.mileage && (
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <span>{formatMileage(listing.mileage)}</span>
                    </div>
                  )}
                  
                  {listing.color && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{backgroundColor: listing.color.toLowerCase()}}></div>
                      <span>{listing.color}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Vendedor</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewSellerProfile}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {listing.profiles.profile_photo ? (
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
                      <div className="font-medium">
                        {listing.profiles.user_type === 'pj' 
                          ? listing.profiles.razao_social 
                          : listing.profiles.full_name}
                      </div>
                      <VerificationBadge isVerified={listing.profiles.profile_completed || false} />
                    </div>
                  </div>
                </div>
                
                {listing.profiles.phone_display && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleContactClick();
                        window.location.href = `tel:${listing.profiles.phone_display}`;
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {listing.profiles.phone_display}
                    </Button>
                    
                    <Button
                      size="icon"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleContactClick();
                        window.open(`https://wa.me/55${formatPhoneForWhatsApp(listing.profiles.phone_display)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Descrição</h3>
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seller Profile Modal */}
        <SellerProfileModal
          isOpen={showSellerModal}
          onClose={() => setShowSellerModal(false)}
          seller={listing.profiles}
        />
      </div>
    </div>
  );
}
