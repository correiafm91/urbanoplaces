
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Search, Filter, Car, Bike } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Listing {
  id: string;
  title: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  images: string[];
  category: string;
  city: {
    name: string;
    state: string;
  };
  created_at: string;
}

export default function Index() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedState, setSelectedState] = useState<string>("todos");
  const [priceRange, setPriceRange] = useState<string>("todos");
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedState, priceRange]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          brand,
          model,
          year,
          mileage,
          images,
          category,
          city:cities(name, state),
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== "todos") {
        query = query.eq('category', selectedCategory);
      }

      if (selectedState !== "todos") {
        query = query.eq('cities.state', selectedState);
      }

      if (priceRange !== "todos") {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          query = query.gte('price', min).lte('price', max);
        } else {
          query = query.gte('price', min);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar anúncios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="bg-muted rounded h-4 w-3/4 mb-2"></div>
                <div className="bg-muted rounded h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Encontre seu veículo ideal</h1>
          <p className="text-xl text-muted-foreground">
            Os melhores carros e motos do Brasil em um só lugar
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por marca, modelo ou título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas categorias</SelectItem>
                <SelectItem value="carros">Carros</SelectItem>
                <SelectItem value="motos">Motos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos estados</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos preços</SelectItem>
                <SelectItem value="0-20000">Até R$ 20.000</SelectItem>
                <SelectItem value="20000-50000">R$ 20.000 - R$ 50.000</SelectItem>
                <SelectItem value="50000-100000">R$ 50.000 - R$ 100.000</SelectItem>
                <SelectItem value="100000">Acima de R$ 100.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <Car className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-semibold">Carros</h3>
                <p className="text-blue-100">
                  {filteredListings.filter(l => l.category === 'carros').length} anúncios disponíveis
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <Bike className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-semibold">Motos</h3>
                <p className="text-orange-100">
                  {filteredListings.filter(l => l.category === 'motos').length} anúncios disponíveis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Todos os Anúncios</h2>
            <div className="text-sm text-muted-foreground">
              {filteredListings.length} resultado(s) encontrado(s)
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros para encontrar o que você procura
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
