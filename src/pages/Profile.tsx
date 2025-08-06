import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Star, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ListingSelectionModal } from "@/components/ListingSelectionModal";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type?: string;
  phone: string;
  phone_display?: string;
  city_id?: string;
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  instagram?: string;
  free_ads_used: number;
  paid_ads_balance: number;
  profile_photo?: string;
  profile_completed: boolean;
}

interface City {
  id: string;
  name: string;
  state: string;
  zip_code?: string;
}

interface UserListing {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  created_at: string;
  category: string;
  plans?: {
    plan_type: string;
  };
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCities();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    fetchProfile(user.id);
    fetchListings(user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          is_active,
          created_at,
          category,
          plans(plan_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          phone_display: profile.phone_display,
          city_id: profile.city_id,
          cpf: profile.cpf,
          cnpj: profile.cnpj,
          razao_social: profile.razao_social,
          instagram: profile.instagram,
          profile_photo: profile.profile_photo,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      setListings(prev => prev.filter(listing => listing.id !== listingId));

      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi removido com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleListingSelected = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowListingModal(false);
    setShowPlanModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted rounded-lg h-32"></div>
            <div className="bg-muted rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black">Perfil não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-black">Olá, {profile.full_name}!</h1>
                <VerificationBadge isVerified={profile.profile_completed} />
              </div>
              <p className="text-muted-foreground">Gerencie suas informações e anúncios</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <p className="text-sm text-muted-foreground">Anúncios disponíveis</p>
                <p className="text-xs text-green-600">Ilimitado e gratuito!</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-black">{listings.length}</div>
                <p className="text-sm text-muted-foreground">Anúncios criados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-black">
                  {listings.filter(l => l.is_active).length}
                </div>
                <p className="text-sm text-muted-foreground">Anúncios ativos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Settings className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileImageUpload
                  currentImage={profile.profile_photo}
                  onImageChange={(imageUrl) => setProfile({ ...profile, profile_photo: imageUrl })}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-black">
                    {profile.user_type === 'pj' ? 'Razão Social' : 'Nome Completo'}
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.user_type === 'pj' ? profile.razao_social || '' : profile.full_name}
                    onChange={(e) => setProfile({
                      ...profile,
                      ...(profile.user_type === 'pj' 
                        ? { razao_social: e.target.value }
                        : { full_name: e.target.value }
                      )
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_display" className="text-black">
                    Telefone para exibir no anúncio
                  </Label>
                  <Input
                    id="phone_display"
                    value={profile.phone_display || ''}
                    onChange={(e) => setProfile({ ...profile, phone_display: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este número será exibido nos seus anúncios
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-black">Cidade</Label>
                  <Select
                    value={profile.city_id || ''}
                    onValueChange={(value) => setProfile({ ...profile, city_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                          {city.zip_code && ` - ${city.zip_code}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {profile.user_type === 'pf' && (
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-black">CPF</Label>
                    <Input
                      id="cpf"
                      value={profile.cpf || ''}
                      onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                )}

                {profile.user_type === 'pj' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-black">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={profile.cnpj || ''}
                        onChange={(e) => setProfile({ ...profile, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-black">Instagram</Label>
                      <Input
                        id="instagram"
                        value={profile.instagram || ''}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        placeholder="@suaempresa"
                      />
                    </div>
                  </>
                )}

                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="w-full"
                  style={{ backgroundColor: '#FFCD44', color: 'black' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>

            {/* My Listings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Star className="w-5 h-5" />
                  Meus Anúncios
                </CardTitle>
                <CardDescription>
                  Gerencie seus anúncios ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/create-listing')}
                    className="w-full"
                    style={{ backgroundColor: '#FFCD44', color: 'black' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                  >
                    Criar Novo Anúncio
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {listings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Você ainda não tem anúncios
                      </p>
                    ) : (
                      listings.map((listing) => (
                        <div key={listing.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2 text-black">
                                {listing.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="text-black">{formatPrice(listing.price)}</span>
                                <span>•</span>
                                <span>{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <CategoryBadge 
                                  category={listing.category} 
                                  planType={listing.plans?.plan_type} 
                                />
                              </div>
                            </div>
                            <Badge 
                              variant={listing.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {listing.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/listing/${listing.id}`)}
                              className="flex-1 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteListing(listing.id)}
                              className="flex-1 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />
                
                {/* Highlight Plans Section - moved inside listings card */}
                <div className="pt-4">
                  <h4 className="font-medium mb-2 text-black">Destaque seus anúncios</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione um anúncio para destacar
                  </p>
                  <Button 
                    onClick={() => setShowListingModal(true)}
                    className="w-full"
                    style={{ backgroundColor: '#FFCD44', color: 'black' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                    disabled={listings.filter(l => l.is_active).length === 0}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Ver Planos Disponíveis
                  </Button>
                  {listings.filter(l => l.is_active).length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Você precisa ter pelo menos um anúncio ativo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showListingModal && user && (
        <ListingSelectionModal
          isOpen={showListingModal}
          onClose={() => setShowListingModal(false)}
          onListingSelected={handleListingSelected}
          user={user}
        />
      )}

      {showPlanModal && user && selectedListingId && (
        <PlanSelectionModal
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedListingId("");
          }}
          user={user}
          listingId={selectedListingId}
          onPlanSelected={() => {
            setShowPlanModal(false);
            setSelectedListingId("");
            fetchListings(user.id);
          }}
        />
      )}
    </div>
  );
}
