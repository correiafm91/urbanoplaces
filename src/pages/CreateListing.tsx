
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Car, Upload, X } from "lucide-react";
import { VerificationModal } from "@/components/VerificationModal";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";

interface City {
  id: string;
  name: string;
  state: string;
  zip_code?: string;
}

const carBrands = ["Toyota", "Honda", "Ford", "Chevrolet", "Volkswagen"];
const motoBrands = ["Honda", "Yamaha", "Suzuki"];

const listingSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  price: z.string().min(1, "Preço é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.string().min(4, "Ano deve ter 4 dígitos"),
  mileage: z.string().optional(),
  color: z.string().optional(),
  city_id: z.string().min(1, "Cidade é obrigatória"),
  zip_code: z.string().optional(),
});

export default function CreateListing() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"carros" | "motos" | "">("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      brand: "",
      model: "",
      year: "",
      mileage: "",
      color: "",
      city_id: "",
      zip_code: "",
    },
  });

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

    // Check if user profile is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      toast({
        title: "Perfil não encontrado",
        description: "Faça login novamente",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setProfile(profile);

    // Check if user is verified
    if (!profile.is_verified) {
      setShowVerificationModal(true);
    }

    setLoading(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof listingSchema>) => {
    if (!profile?.is_verified) {
      setShowVerificationModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          title: values.title,
          description: values.description,
          price: parseFloat(values.price.replace(/\D/g, '')),
          brand: values.brand,
          model: values.model,
          year: parseInt(values.year),
          mileage: values.mileage ? parseInt(values.mileage.replace(/\D/g, '')) : null,
          color: values.color || null,
          city_id: values.city_id,
          user_id: user.id,
          images: images,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Create listing details entry
      await supabase
        .from('listing_details')
        .insert({
          listing_id: listing.id,
          views_count: 0,
          contact_clicks: 0,
        });

      toast({
        title: "Anúncio criado!",
        description: "Seu anúncio foi publicado com sucesso",
      });

      // Show plan selection modal
      setShowPlanModal(true);
    } catch (error: any) {
      toast({
        title: "Erro ao criar anúncio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerificationModal(false);
    setProfile({ ...profile, is_verified: true });
  };

  const handlePlanSelected = (planType: string) => {
    setShowPlanModal(false);
    navigate('/', { 
      state: { 
        message: planType === 'free' 
          ? "Anúncio publicado com sucesso!" 
          : "Anúncio publicado com destaque!"
      }
    });
  };

  const availableBrands = selectedCategory === "carros" ? carBrands : selectedCategory === "motos" ? motoBrands : [...carBrands, ...motoBrands];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCD44]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#FFCD44] rounded-full">
              <Car className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Criar Anúncio</h1>
              <p className="text-muted-foreground">Publique seu veículo gratuitamente</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Categoria</CardTitle>
                <CardDescription>Selecione o tipo do seu veículo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={selectedCategory === "carros" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("carros")}
                    className="h-16"
                  >
                    <Car className="w-6 h-6 mr-2" />
                    Carros
                  </Button>
                  <Button
                    type="button"
                    variant={selectedCategory === "motos" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("motos")}
                    className="h-16"
                  >
                    🏍️
                    <span className="ml-2">Motos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Título do Anúncio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honda Civic 2020 automático" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva seu veículo em detalhes..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Marca</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a marca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Civic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Ano</FormLabel>
                        <FormControl>
                          <Input placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Quilometragem</FormLabel>
                        <FormControl>
                          <Input placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Cor</FormLabel>
                        <FormControl>
                          <Input placeholder="Branco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="50000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="city_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Cidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione sua cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}, {city.state}
                              {city.zip_code && ` - ${city.zip_code}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">CEP (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="01234-567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Fotos</CardTitle>
                <CardDescription>Adicione fotos do seu veículo (máximo 5MB cada)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {images.length < 10 && (
                    <Label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50">
                      <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Adicionar</span>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
              size="lg"
            >
              {submitting ? "Publicando..." : "Publicar Anúncio"}
            </Button>
          </form>
        </Form>
      </div>

      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          user={user}
          cities={cities}
          onVerificationComplete={handleVerificationComplete}
        />
      )}

      {showPlanModal && (
        <PlanSelectionModal
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            navigate('/');
          }}
          user={user}
          onPlanSelected={handlePlanSelected}
        />
      )}
    </div>
  );
}
