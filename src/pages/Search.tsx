
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, Filter, X } from "lucide-react";

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
  "Toyota", "Honda", "Ford", "Chevrolet", "Volkswagen"
];

const motoBrands = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW", "Harley-Davidson"
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          city:cities(name, state)
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      const q = searchParams.get('q');
      const brand = searchParams.get('brand');
      const category = searchParams.get('category');
      const minP = searchParams.get('minPrice');
      const maxP = searchParams.get('maxPrice');

      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%`);
      }

      if (brand && brand !== 'all') {
        query = query.eq('brand', brand);
      }

      if (minP) {
        query = query.gte('price', parseFloat(minP));
      }

      if (maxP) {
        query = query.lte('price', parseFloat(maxP));
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter by category (car/moto) based on brand
      let filteredData = data || [];
      if (category && category !== 'all') {
        if (category === 'carros') {
          filteredData = data?.filter(listing => 
            carBrands.some(brand => brand.toLowerCase() === listing.brand.toLowerCase())
          ) || [];
        } else if (category === 'motos') {
          filteredData = data?.filter(listing => 
            motoBrands.some(brand => brand.toLowerCase() === listing.brand.toLowerCase())
          ) || [];
        }
      }

      setListings(filteredData);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-black">Buscar Anúncios</h1>
          
          {/* Main Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por marca, modelo, título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="carros">Carros</SelectItem>
                      <SelectItem value="motos">Motos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {selectedCategory === 'carros' ? (
                        carBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))
                      ) : selectedCategory === 'motos' ? (
                        motoBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))
                      ) : (
                        [...carBrands, ...motoBrands].map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Preço mín."
                    value={minPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setMinPrice(value);
                    }}
                  />

                  <Input
                    placeholder="Preço máx."
                    value={maxPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setMaxPrice(value);
                    }}
                  />

                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? 'Buscando...' : `${listings.length} anúncios encontrados`}
          </p>
        </div>

        {/* Listings Grid */}
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
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-black">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros de busca ou usar termos diferentes
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
