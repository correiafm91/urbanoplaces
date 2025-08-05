
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Circle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  plan_type: string;
  price: number;
  description: string;
  pix_code: string;
}

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onPlanSelected: () => void;
  listingId?: string;
}

const plans: Plan[] = [
  {
    id: "prata",
    plan_type: "Prata",
    price: 110,
    description: "Destaque visual na busca",
    pix_code: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406110.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO621405106IIWeaNOKU6304EB8F",
  },
  {
    id: "ouro",
    plan_type: "Ouro",
    price: 240,
    description: "Destaque + selo de confiança + prioridade",
    pix_code: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406240.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510JgPBi1WRn56304D661",
  },
  {
    id: "diamante",
    plan_type: "Diamante",
    price: 345,
    description: "Tudo do Ouro + aparece no topo e em banners",
    pix_code: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406345.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510gtDjrHl51x630490FE",
  },
];

export function PlanSelectionModal({ isOpen, onClose, user, onPlanSelected, listingId }: PlanSelectionModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const copyPixCode = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código PIX copiado",
      description: "O código PIX foi copiado para a área de transferência",
    });
  };

  const confirmPayment = async () => {
    if (!selectedPlan) return;

    setConfirming(true);
    try {
      // Simulate payment confirmation and plan activation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Pagamento confirmado",
        description: `Seu plano ${selectedPlan.plan_type} foi ativado com sucesso!`,
      });

      onPlanSelected();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleFreeOption = () => {
    toast({
      title: "Anúncio mantido gratuito",
      description: "Seu anúncio continuará com a versão gratuita",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Planos de Destaque</DialogTitle>
          <DialogDescription>
            Planos válidos por 30 dias - Escolha o plano ideal para destacar seu anúncio
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Escolha seu plano
            </h3>
            <RadioGroup onValueChange={(value) => {
              const plan = plans.find(p => p.id === value);
              if (plan) handlePlanSelect(plan);
            }}>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                    <Label htmlFor={plan.id} className="flex flex-col items-start w-full cursor-pointer">
                      <div className="flex items-center justify-between w-full mb-2">
                        <h4 className="font-medium text-foreground">{plan.plan_type}</h4>
                        <div className="relative">
                          <RadioGroupItem value={plan.id} id={plan.id} className="opacity-0 absolute" />
                          <Circle className="w-5 h-5 text-muted-foreground" />
                          <Check className="w-3 h-3 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      <p className="text-lg font-semibold text-foreground">{formatPrice(plan.price)}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleFreeOption}
                className="w-full"
              >
                Continuar com anúncio grátis
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Dados para Pagamento via PIX
            </h3>
            {selectedPlan && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-foreground">{selectedPlan.plan_type}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{formatPrice(selectedPlan.price)}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Valor:</span>
                    <span className="font-semibold text-foreground">{formatPrice(selectedPlan.price)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">Código PIX:</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPixCode(selectedPlan.pix_code)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-background p-3 rounded border font-mono text-xs break-all">
                      {selectedPlan.pix_code}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">
                    Importante:
                  </p>
                  <p className="text-sm text-yellow-700">
                    Após realizar o PIX, confirme o pagamento abaixo. O plano será ativado imediatamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">🚫</span>
                <div>
                  <p className="font-semibold text-red-800 mb-2">
                    Atenção: Confirmar pagamento sem ter realizado o PIX é fraude.
                  </p>
                  <p className="text-sm text-red-700">
                    Toda tentativa de confirmação falsa será detectada e resultará no 
                    cancelamento imediato da conta, além do bloqueio permanente do acesso à plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={confirming}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {confirming ? "Confirmando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
