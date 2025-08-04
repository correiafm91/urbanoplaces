
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/ListingCard";
import { Search, Car, Bike, Instagram, Shield, Eye, Users, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  city: {
    name: string;
    state: string;
  };
  created_at: string;
  is_featured: boolean;
}

const carBrands = [
  { name: "Toyota", count: "1.200+" },
  { name: "Honda", count: "980+" },
  { name: "Ford", count: "750+" },
  { name: "Chevrolet", count: "650+" },
  { name: "Volkswagen", count: "540+" }
];

const motoBrands = [
  { name: "Honda", count: "450+" },
  { name: "Yamaha", count: "320+" },
  { name: "Suzuki", count: "290+" }
];

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          city:cities(name, state)
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleBrandClick = (brand: string, category: string) => {
    navigate(`/search?brand=${brand}&category=${category}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FFCD44] to-[#FFE066] py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-black mb-6">
            Urbano Places
          </h1>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            A plataforma líder em compra e venda de veículos. Encontre o carro ou moto dos seus sonhos com facilidade e segurança.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar carros, motos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-white"
              />
            </div>
            <Button type="submit" size="lg" className="bg-black text-white hover:bg-black/90">
              <Search className="w-5 h-5" />
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white hover:bg-white/90"
              onClick={() => navigate('/search?category=carros')}
            >
              <Car className="w-5 h-5 mr-2" />
              Ver Carros
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white hover:bg-white/90"
              onClick={() => navigate('/search?category=motos')}
            >
              <Bike className="w-5 h-5 mr-2" />
              Ver Motos
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Marcas Populares</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Cars */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-3">
                <Car className="w-6 h-6 text-[#FFCD44]" />
                Carros
              </h3>
              <div className="grid gap-3">
                {carBrands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand.name, 'carros')}
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-[#FFCD44]/10 transition-colors text-left group"
                  >
                    <span className="font-medium text-black group-hover:text-[#FFCD44]">
                      {brand.name}
                    </span>
                    <Badge variant="secondary">{brand.count}</Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Motos */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-3">
                <Bike className="w-6 h-6 text-[#FFCD44]" />
                Motos
              </h3>
              <div className="grid gap-3">
                {motoBrands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand.name, 'motos')}
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-[#FFCD44]/10 transition-colors text-left group"
                  >
                    <span className="font-medium text-black group-hover:text-[#FFCD44]">
                      {brand.name}
                    </span>
                    <Badge variant="secondary">{brand.count}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">Anúncios em Destaque</h2>
            <p className="text-muted-foreground">
              Confira os melhores veículos disponíveis
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 w-3/4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90">
              <Link to="/search">Ver Todos os Anúncios</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Por que escolher o Urbano Places?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-[#FFCD44] rounded-full w-fit">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-black">Segurança Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Verificamos todos os anunciantes e oferecemos dicas de segurança para compras tranquilas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-[#FFCD44] rounded-full w-fit">
                  <Eye className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-black">Anúncios Gratuitos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Publique quantos anúncios quiser gratuitamente. Pague apenas para destacar.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-[#FFCD44] rounded-full w-fit">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-black">Maior Alcance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Milhares de pessoas acessam nossa plataforma diariamente em busca do veículo ideal.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#FFCD44]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Pronto para anunciar seu veículo?
          </h2>
          <p className="text-black/80 mb-8 text-lg">
            Cadastre-se gratuitamente e publique seu anúncio em minutos
          </p>
          <Button asChild size="lg" className="bg-black text-white hover:bg-black/90">
            <Link to="/create-listing">Anunciar Gratuitamente</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Urbano Places</h3>
              <p className="text-white/70">
                A plataforma líder em compra e venda de veículos no Brasil.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <div className="space-y-2">
                <Link to="/safety-tips" className="block text-white/70 hover:text-white">
                  Dicas de Segurança
                </Link>
                <Link to="/terms-of-use" className="block text-white/70 hover:text-white">
                  Termos de Uso
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2">
                <a
                  href="https://www.instagram.com/urbano.places/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white"
                >
                  <Instagram className="w-4 h-4" />
                  @urbano.places
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Para Anunciantes</h4>
              <div className="space-y-2">
                <Link to="/create-listing" className="block text-white/70 hover:text-white">
                  Criar Anúncio
                </Link>
                <Link to="/profile" className="block text-white/70 hover:text-white">
                  Gerenciar Anúncios
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">
              © 2024 Urbano Places. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
