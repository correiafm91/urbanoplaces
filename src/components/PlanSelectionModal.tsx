
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Star, Shield, Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPlanSelected: (planType: string) => void;
}

const plans = [
  {
    id: "prata",
    name: "Prata",
    price: 110,
    duration: "30 dias",
    features: ["Destaque visual na busca"],
    pixCode: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406110.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO621405106IIWeaNOKU6304EB8F",
    icon: Star,
    color: "border-gray-300"
  },
  {
    id: "ouro",
    name: "Ouro",
    price: 240,
    duration: "30 dias",
    features: ["Destaque visual", "Selo de confiança", "Prioridade nas buscas"],
    pixCode: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406240.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510JgPBi1WRn56304D661",
    icon: Shield,
    color: "border-yellow-400"
  },
  {
    id: "diamante",
    name: "Diamante",
    price: 345,
    duration: "30 dias",
    features: ["Tudo do Ouro", "Aparece no topo", "Exibição em banners"],
    pixCode: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406345.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510gtDjrHl51x630490FE",
    icon: Zap,
    color: "border-blue-400"
  }
];

export function PlanSelectionModal({ isOpen, onClose, user, onPlanSelected }: PlanSelectionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [canConfirmPayment, setCanConfirmPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has left and returned to enable payment confirmation
    const checkVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('payment_page_visited', 'true');
      } else {
        if (localStorage.getItem('payment_page_visited') === 'true') {
          setCanConfirmPayment(true);
        }
      }
    };

    document.addEventListener('visibilitychange', checkVisibilityChange);
    
    // Check if already visited
    if (localStorage.getItem('payment_page_visited') === 'true') {
      setCanConfirmPayment(true);
    }

    return () => {
      document.removeEventListener('visibilitychange', checkVisibilityChange);
    };
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleFreePlan = () => {
    onPlanSelected("free");
    onClose();
  };

  const copyPixCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu aplicativo bancário para realizar o pagamento.",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const confirmPayment = async () => {
    if (!selectedPlan) return;

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          plan_type: plan.id,
          price: plan.price,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (error) throw error;

      localStorage.removeItem('payment_page_visited');
      
      toast({
        title: "Pagamento confirmado!",
        description: `Plano ${plan.name} ativado por 30 dias.`,
      });

      onPlanSelected(plan.id);
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-black">Escolha seu plano de destaque</DialogTitle>
          <DialogDescription>
            Válido por 30 dias - Destaque seu anúncio e venda mais rápido!
          </DialogDescription>
        </DialogHeader>

        {!showPayment ? (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card key={plan.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${plan.color}`}>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-2">
                      <IconComponent className="w-8 h-8 text-[#FFCD44]" />
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2 text-black">
                      {plan.name}
                      <Badge className="bg-[#FFCD44] text-black">💎</Badge>
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-[#FFCD44]">R$ {plan.price}</span>
                      <br />
                      <span className="text-sm">{plan.duration}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handlePlanSelect(plan.id)}
                      className="w-full bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-black">
                Plano {selectedPlanData?.name} - R$ {selectedPlanData?.price}
              </h3>
              <p className="text-muted-foreground">
                Copie o código PIX abaixo e realize o pagamento no seu aplicativo bancário
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-black">Código PIX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm mb-4">
                  {selectedPlanData?.pixCode}
                </div>
                <Button 
                  onClick={() => copyPixCode(selectedPlanData?.pixCode || "")}
                  className="w-full bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedCode ? "Copiado!" : "Copiar código PIX"}
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              💡 O botão "Confirmar Pagamento" aparecerá após você sair desta página e retornar
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="flex-1"
              >
                Voltar aos planos
              </Button>
              {canConfirmPayment && (
                <Button
                  onClick={confirmPayment}
                  className="flex-1 bg-[#FFCD44] text-black hover:bg-[#FFCD44]/90"
                >
                  Confirmar Pagamento
                </Button>
              )}
            </div>
          </div>
        )}

        {!showPayment && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleFreePlan}
              className="w-full"
            >
              Continuar com anúncio grátis
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              ✅ Anúncios gratuitos são ilimitados!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
