import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";
import { ListingSelectionModal } from "@/components/ListingSelectionModal";
import { ImageUploadMultiple } from "@/components/ImageUploadMultiple";

interface City {
  id: string;
  name: string;
  state: string;
  zip_code?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  const [color, setColor] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListingForPlan, setSelectedListingForPlan] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchCities();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !description || !price || !brand || !model || !year || !cityId || !categoryId || images.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert({
          title,
          description,
          price,
          brand,
          model,
          year,
          mileage,
          color,
          images,
          city_id: cityId,
          category: categoryId,
          user_id: user.id,
          is_featured: isFeatured,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Anúncio criado",
        description: "Seu anúncio foi criado com sucesso com marca d'água aplicada nas imagens",
      });

      if (isFeatured) {
        setSelectedListingForPlan(data.id);
        setShowPlanModal(true);
      } else {
        navigate(`/listing/${data.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = (checked: boolean) => {
    setIsFeatured(checked);
    if (checked) {
      setShowListingModal(true);
    }
  };

  const handleListingSelected = (listingId: string) => {
    setSelectedListingForPlan(listingId);
    setShowListingModal(false);
    setShowPlanModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Criar Anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-foreground">Título</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-foreground">Preço</Label>
                <Input
                  type="number"
                  id="price"
                  value={price.toString()}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand" className="text-foreground">Marca</Label>
                  <Input
                    type="text"
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="model" className="text-foreground">Modelo</Label>
                  <Input
                    type="text"
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year" className="text-foreground">Ano</Label>
                  <Input
                    type="number"
                    id="year"
                    value={year.toString()}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="mileage" className="text-foreground">
                    Quilometragem (opcional)
                  </Label>
                  <Input
                    type="number"
                    id="mileage"
                    value={mileage !== undefined ? mileage.toString() : ''}
                    onChange={(e) => setMileage(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color" className="text-foreground">Cor (opcional)</Label>
                <Input
                  type="text"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-foreground">Cidade</Label>
                <Select
                  value={cityId}
                  onValueChange={(value) => setCityId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
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

              <div>
                <Label htmlFor="category" className="text-foreground">Categoria</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground">Imagens</Label>
                <ImageUploadMultiple
                  images={images}
                  onImagesChange={setImages}
                  maxImages={8}
                  listingId={selectedListingForPlan || 'preview'}
                />
              </div>

              <div>
                <Label htmlFor="isFeatured" className="text-foreground">Destaque</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={handleFeatureToggle}
                  />
                  <p className="text-sm text-muted-foreground">
                    Destaque seu anúncio para aumentar a visibilidade
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Criar Anúncio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {showListingModal && user && (
        <ListingSelectionModal
          isOpen={showListingModal}
          onClose={() => {
            setShowListingModal(false);
            setIsFeatured(false);
          }}
          onListingSelected={handleListingSelected}
          user={user}
        />
      )}

      {showPlanModal && user && (
        <PlanSelectionModal
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setIsFeatured(false);
          }}
          user={user}
          onPlanSelected={() => {
            setShowPlanModal(false);
            if (selectedListingForPlan) {
              navigate(`/listing/${selectedListingForPlan}`);
            }
          }}
          listingId={selectedListingForPlan}
        />
      )}
    </div>
  );
}
