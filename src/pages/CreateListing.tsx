import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Upload, X, ImageIcon } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  price: z.string().min(1, "Preço é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.string().min(4, "Ano é obrigatório"),
  mileage: z.string().optional(),
  color: z.string().optional(),
  city_id: z.string().min(1, "Cidade é obrigatória"),
});

interface City {
  id: string;
  name: string;
  state: string;
}

export default function CreateListing() {
  const [user, setUser] = useState<User | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    },
  });

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
          return;
        }
        setUser(session.user);
      }
    );

    fetchCities();

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um anúncio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user profile to ensure it exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Erro",
          description: "Perfil não encontrado. Tente fazer login novamente.",
          variant: "destructive",
        });
        return;
      }

      // Create the listing
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: values.title,
          description: values.description,
          price: parseFloat(values.price),
          brand: values.brand,
          model: values.model,
          year: parseInt(values.year),
          mileage: values.mileage ? parseInt(values.mileage) : null,
          color: values.color || null,
          city_id: values.city_id,
          images: images,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu anúncio foi publicado e está disponível para visualização.",
      });

      navigate(`/listing/${data.id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Erro ao criar anúncio",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const motorcycleBrands = [
    "Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW", "Ducati", 
    "Harley-Davidson", "KTM", "Triumph", "Aprilia", "MV Agusta", 
    "Benelli", "Shineray", "Dafra", "Traxx", "Outras"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const colors = [
    "Preto", "Branco", "Prata", "Cinza", "Azul", "Vermelho", 
    "Verde", "Amarelo", "Laranja", "Roxo", "Dourado", "Outras"
  ];

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Anúncio</CardTitle>
            <CardDescription>
              Preencha as informações da sua moto para criar um anúncio
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Images Upload */}
                <div className="space-y-4">
                  <Label>Fotos da moto</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground">
                        Clique para adicionar fotos (máximo 10)
                      </span>
                    </label>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do anúncio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Honda CB 600F Hornet 2018 - Excelente estado"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva sua moto: estado de conservação, histórico, modificações, etc."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 15000"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a marca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motorcycleBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
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
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: CB 600F Hornet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Year, Mileage, Color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
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
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quilometragem</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 25000"
                            min="0"
                            {...field}
                          />
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
                        <FormLabel>Cor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a cor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* City */}
                <FormField
                  control={form.control}
                  name="city_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}, {city.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Publicando..." : "Publicar Anúncio"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}