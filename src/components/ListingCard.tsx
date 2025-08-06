
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return null;
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
  };

  const getMainImage = () => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    return '/placeholder.svg';
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={imageError ? '/placeholder.svg' : getMainImage()}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Badge>
          </div>

          {/* Preço em destaque sobre a imagem em cor preta */}
          <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1 rounded-md">
            <span className="text-lg font-bold text-black bg-white px-2 py-1 rounded">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {listing.year}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>{listing.brand} {listing.model}</p>
              {listing.mileage && (
                <p className="flex items-center gap-1">
                  {formatMileage(listing.mileage)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{listing.city.name}, {listing.city.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
