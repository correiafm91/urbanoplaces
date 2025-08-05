
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeaturedBadgeProps {
  planType?: string;
  className?: string;
}

export function FeaturedBadge({ planType, className = "" }: FeaturedBadgeProps) {
  if (!planType) return null;

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'prata': return 'bg-gray-500 hover:bg-gray-600';
      case 'ouro': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'diamante': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <Badge className={`absolute top-2 left-2 z-10 text-white ${getPlanColor(planType)} ${className}`}>
      <Star className="w-3 h-3 mr-1" />
      Destacado
    </Badge>
  );
}
