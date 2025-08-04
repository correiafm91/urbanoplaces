
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Car, Bike, Truck, Ship, Package, MapPin, Calendar, Eye, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";

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
  category: string;
  city: {
    name: string;
    state: string;
  };
  created_at: string;
  is_active: boolean;
  is_featured: boolean;
}

interface CategoryStats {
  category: string;
  count: number;
  brands: { [key: string]: number };
}

export default function Index() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
    fetchCategoryStats();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          brand,
          model,
          year,
          mileage,
          color,
          images,
          category,
          created_at,
          is_active,
          is_featured,
          city:cities(name, state)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('category, brand')
        .eq('is_active', true);

      if (error) throw error;

      // Process the data to get category and brand counts
      const stats: { [key: string]: { count: number; brands: { [key: string]: number } } } = {};
      
      data?.forEach(listing => {
        if (!stats[listing.category]) {
          stats[listing.category] = { count: 0, brands: {} };
        }
        stats[listing.category].count++;
        
        if (!stats[listing.category].brands[listing.brand]) {
          stats[listing.category].brands[listing.brand] = 0;
        }
        stats[listing.category].brands[listing.brand]++;
      });

      const categoryStatsArray = Object.entries(stats).map(([category, data]) => ({
        category,
        count: data.count,
        brands: data.brands
      }));

      setCategoryStats(categoryStatsArray);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carros': return <Car className="w-5 h-5" />;
      case 'motos': return <Bike className="w-5 h-5" />;
      case 'vans': return <Truck className="w-5 h-5" />;
      case 'barcos': return <Ship className="w-5 h-5" />;
      case 'outros': return <Package className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'carros': return 'Carros';
      case 'motos': return 'Motos';
      case 'vans': return 'Vans';
      case 'barcos': return 'Barcos';
      case 'outros': return 'Outros';
      default: return 'Carros';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            Encontre seu veículo dos sonhos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A maior plataforma de venda de veículos do Brasil. Anuncie grátis e venda mais rápido!
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-4">
            <Input
              type="text"
              placeholder="Ex: Honda Civic 2020, Ford Ka, Yamaha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">
            Categorias
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoryStats.map((stat) => (
              <Link
                key={stat.category}
                to={`/search?category=${stat.category}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4 text-blue-600">
                      {getCategoryIcon(stat.category)}
                    </div>
                    <h3 className="font-semibold mb-2 text-black">
                      {getCategoryName(stat.category)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {stat.count} anúncios
                    </Badge>
                    
                    {/* Top brands for this category */}
                    <div className="mt-3 space-y-1">
                      {Object.entries(stat.brands)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([brand, count]) => (
                          <div key={brand} className="text-xs text-gray-600">
                            {brand}: {count}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black">Anúncios Recentes</h2>
            <Link to="/search">
              <Button variant="outline">Ver todos</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 w-3/4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para vender seu veículo?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Anuncie grátis e alcance milhares de compradores interessados
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/create-listing')}>
            Anunciar Agora
          </Button>
        </div>
      </section>
    </div>
  );
}
