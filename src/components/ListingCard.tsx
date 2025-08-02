import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar, Gauge } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
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
  };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "Não informado";
    return `${mileage.toLocaleString('pt-BR')} km`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/listing/${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to favorites functionality
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/listing/${listing.id}`}>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {listing.brand} {listing.model}
                </Badge>
                <span className="text-sm text-muted-foreground">{listing.year}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{listing.city.name}, {listing.city.state}</span>
              </div>
              
              {listing.mileage && (
                <div className="flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  <span>{formatMileage(listing.mileage)}</span>
                </div>
              )}
            </div>
            
            {listing.color && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Cor:</span>
                <span className="text-sm font-medium">{listing.color}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(listing.price)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};