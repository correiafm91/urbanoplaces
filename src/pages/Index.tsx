import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, TrendingUp, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
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
  created_at: string;
  cities: {
    name: string;
    state: string;
  };
  city: {
    name: string;
    state: string;
  };
}

interface City {
  id: string;
  name: string;
  state: string;
}

const Index = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedListings();
    fetchCities();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          cities (
            name,
            state
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map(listing => ({
        ...listing,
        city: listing.cities
      })) || [];
      
      setFeaturedListings(transformedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity && selectedCity !== "all") params.set('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const popularBrands = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Harley-Davidson'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Encontre sua moto ideal
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O maior marketplace de motos do Brasil. Compre e venda com segurança.
            </p>
          </div>
          
          {/* Search Box */}
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar marca, modelo ou palavra-chave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Escolha a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Marcas Populares</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {popularBrands.map((brand) => (
              <Button
                key={brand}
                variant="outline"
                onClick={() => navigate(`/search?q=${brand}`)}
                className="h-12 px-6"
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Anúncios em Destaque</h2>
            <Button variant="outline" asChild>
              <a href="/search">Ver todos</a>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Nenhum anúncio encontrado. Seja o primeiro a anunciar!
                </p>
                <Button className="mt-4" asChild>
                  <a href="/auth">Criar primeiro anúncio</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-lg text-muted-foreground">Motos anunciadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-lg text-muted-foreground">Cidades atendidas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-lg text-muted-foreground">Clientes satisfeitos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">U</span>
                </div>
                <span className="text-xl font-bold">Urbano.bikes</span>
              </div>
              <p className="text-background/80">
                O maior marketplace de motos do Brasil. Compre e venda com segurança.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2 text-background/80">
                <li><a href="/search" className="hover:text-background">Buscar motos</a></li>
                <li><a href="/auth" className="hover:text-background">Anunciar</a></li>
                <li><a href="/auth" className="hover:text-background">Minha conta</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background">Como funciona</a></li>
                <li><a href="#" className="hover:text-background">Dicas de segurança</a></li>
                <li><a href="#" className="hover:text-background">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background">Termos de uso</a></li>
                <li><a href="#" className="hover:text-background">Privacidade</a></li>
                <li><a href="#" className="hover:text-background">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 Urbano.bikes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
