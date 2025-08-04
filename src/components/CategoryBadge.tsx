
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Zap } from "lucide-react";

interface CategoryBadgeProps {
  planType?: string;
  category?: string;
}

export function CategoryBadge({ planType, category }: CategoryBadgeProps) {
  const getPlanIcon = (type?: string) => {
    switch (type) {
      case 'prata': return <Star className="w-3 h-3 text-gray-600" />;
      case 'ouro': return <Shield className="w-3 h-3 text-yellow-600" />;
      case 'diamante': return <Zap className="w-3 h-3 text-blue-600" />;
      default: return null;
    }
  };

  const getCategoryName = (cat?: string) => {
    switch (cat) {
      case 'carros': return 'Carro';
      case 'motos': return 'Moto';
      case 'vans': return 'Van';
      case 'barcos': return 'Barco';
      case 'outros': return 'Outros';
      default: return 'Carro';
    }
  };

  return (
    <div className="flex gap-2">
      <Badge variant="secondary" className="text-xs">
        {getCategoryName(category)}
      </Badge>
      {planType && (
        <Badge className="bg-blue-600 text-white">
          {getPlanIcon(planType)}
          <span className="ml-1 text-xs">Destaque</span>
        </Badge>
      )}
    </div>
  );
}
