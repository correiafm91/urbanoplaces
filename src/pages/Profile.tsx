import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";

interface City {
  id: string;
  name: string;
  state: string;
}

interface ProfileData {
  full_name: string;
  user_type: string;
  cpf: string;
  city_id: string;
  profile_photo: string;
}

interface UserListing {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    user_type: "pf",
    cpf: "",
    city_id: "",
    profile_photo: "",
  });
  const [cities, setCities] = useState<City[]>([]);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchCities();
    fetchUserListings();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          user_type: formData.user_type,
          cpf: formData.cpf,
          city_id: formData.city_id,
          profile_photo: formData.profile_photo
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
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

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();

        if (error) throw error;

        setProfile(profileData);
        setFormData({
          full_name: profileData?.full_name || "",
          user_type: profileData?.user_type || "pf",
          cpf: profileData?.cpf || "",
          city_id: profileData?.city_id || "",
          profile_photo: profileData?.profile_photo || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil",
        variant: "destructive",
      });
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state')
        .order('name', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cidades",
        variant: "destructive",
      });
    }
  };

  const fetchUserListings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, price, is_active, created_at')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserListings(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar seus anúncios",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações e anúncios</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Mantenha seus dados atualizados para melhor experiência
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <ProfileImageUpload
                      currentImage={formData.profile_photo}
                      onImageChange={(url) => setFormData(prev => ({ ...prev, profile_photo: url }))}
                    />

                    {/* User Name Display */}
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">{formData.full_name}</h2>
                      <p className="text-sm text-muted-foreground">Pessoa Física</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                          id="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          type="text"
                          value={formData.cpf || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city_id">Cidade</Label>
                      <Select 
                        value={formData.city_id || ""} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}, {city.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">🔒 Marketplace Seguro</h4>
                      <p className="text-sm text-blue-700">
                        Por segurança, todas as comunicações são feitas através do chat interno da plataforma.
                        Dados de contato são automaticamente ocultados para proteger você contra fraudes.
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="w-full"
                      style={{ backgroundColor: '#FFCD44', color: 'black' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                    >
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Anúncios ativos</span>
                    <span className="font-semibold">{userListings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perfil verificado</span>
                    <VerificationBadge isVerified={profile?.profile_completed || false} />
                  </div>
                </CardContent>
              </Card>

              {/* My Listings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Meus Anúncios</CardTitle>
                  <Link to="/create-listing">
                    <Button 
                      size="sm"
                      style={{ backgroundColor: '#FFCD44', color: 'black' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Anúncio
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {userListings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Você ainda não tem anúncios
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userListings.map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{listing.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(listing.price)} • {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/listing/${listing.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
