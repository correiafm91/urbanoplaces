
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar, Gauge, Phone, MessageCircle, Eye, Star, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  city: {
    name: string;
    state: string;
    zip_code?: string;
  };
  created_at: string;
  is_featured: boolean;
  plan_id?: string;
  profiles: {
    full_name: string;
    phone_display?: string;
    user_type?: string;
    razao_social?: string;
  };
  plans?: {
    plan_type: string;
  };
}

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
          profiles(full_name, phone_display, user_type, razao_social),
          plans(plan_type)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
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
      // Insert or update view count
      const { error } = await supabase
        .from('listing_details')
        .upsert({
          listing_id: id,
          views_count: 1
        }, {
          onConflict: 'listing_id',
          ignoreDuplicates: false
        });

      if (error) console.error('Error updating views:', error);
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
      await supabase
        .from('listing_details')
        .upsert({
          listing_id: id,
          contact_clicks: 1
        }, {
          onConflict: 'listing_id',
          ignoreDuplicates: false
        });
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

  const getPlanIcon = (planType?: string) => {
    switch (planType) {
      case 'prata': return <Star className="w-4 h-4 text-gray-500" />;
      case 'ouro': return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'diamante': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              {listing.images?.[currentImageIndex] ? (
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Sem imagem</span>
                </div>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                onClick={toggleFavorite}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              
              {listing.plans && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-[#FFCD44] text-black">
                    {getPlanIcon(listing.plans.plan_type)}
                    <span className="ml-1 capitalize">{listing.plans.plan_type}</span>
                  </Badge>
                </div>
              )}
            </div>
            
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-[#FFCD44]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {listing.brand} {listing.model}
                </Badge>
                <span className="text-sm text-muted-foreground">{listing.year}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="text-4xl font-bold text-[#FFCD44] mb-4">
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
                <h3 className="font-semibold mb-4">Vendedor</h3>
                <div className="space-y-2">
                  <div className="font-medium">
                    {listing.profiles.user_type === 'pj' 
                      ? listing.profiles.razao_social 
                      : listing.profiles.full_name}
                  </div>
                  
                  {listing.profiles.phone_display && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
                        onClick={handleContactClick}
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
                </div>
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
      </div>
    </div>
  );
}
