
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgeProps {
  isVerified: boolean;
  className?: string;
}

export function VerificationBadge({ isVerified, className = "" }: VerificationBadgeProps) {
  if (!isVerified) return null;

  return (
    <Badge className={`bg-green-600 text-white ${className}`}>
      <CheckCircle className="w-3 h-3 mr-1" />
      Verificado
    </Badge>
  );
}
