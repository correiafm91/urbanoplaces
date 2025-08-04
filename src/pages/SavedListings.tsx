
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

interface SavedListing {
  id: string;
  listing: {
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
    is_active: boolean;
  };
}

export default function SavedListings() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSavedListings(user.id);
  };

  const fetchSavedListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          listing:listings(
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
            created_at,
            is_active,
            city:cities(name, state)
          )
        `)
        .eq('user_id', userId)
        .eq('listing.is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any null listings (in case they were deleted)
      const validListings = data?.filter(item => item.listing) || [];
      setSavedListings(validListings);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-black">Anúncios Salvos</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4"></div>
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
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#FFCD44] rounded-full">
            <Heart className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Anúncios Salvos</h1>
            <p className="text-muted-foreground">
              {savedListings.length} anúncios salvos
            </p>
          </div>
        </div>

        {savedListings.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-black">Nenhum anúncio salvo</h3>
            <p className="text-muted-foreground">
              Comece salvando anúncios que te interessam clicando no coração
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedListings.map((saved) => (
              <ListingCard key={saved.id} listing={saved.listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
