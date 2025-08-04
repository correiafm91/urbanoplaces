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
import { Check, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  plan_type: string;
  price: number;
  description: string;
}

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onPlanSelected: () => void;
}

const plans: Plan[] = [
  {
    id: "prata",
    plan_type: "Prata",
    price: 49,
    description: "Destaque seu anúncio por 7 dias",
  },
  {
    id: "ouro",
    plan_type: "Ouro",
    price: 99,
    description: "Destaque seu anúncio por 15 dias",
  },
  {
    id: "diamante",
    plan_type: "Diamante",
    price: 149,
    description: "Destaque seu anúncio por 30 dias",
  },
];

export function PlanSelectionModal({ isOpen, onClose, user, onPlanSelected }: PlanSelectionModalProps) {
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

  const confirmPayment = async () => {
    if (!selectedPlan) return;

    setConfirming(true);
    try {
      // Simulate payment confirmation and plan activation
      // In a real application, you would integrate with a payment gateway
      // and update the user's plan in the database

      // Mock API call
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black">Planos de Destaque</DialogTitle>
          <DialogDescription>
            Escolha o plano ideal para destacar seu anúncio
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Passo 1: Escolha o plano
            </h3>
            <RadioGroup onValueChange={(value) => {
              const plan = plans.find(p => p.id === value);
              if (plan) handlePlanSelect(plan);
            }}>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-2">
                    <Label htmlFor={plan.id} className="flex items-center justify-between w-full">
                      <div>
                        <h4 className="font-medium text-black">{plan.plan_type}</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <p className="text-sm font-semibold text-black">{formatPrice(plan.price)}</p>
                      </div>
                      <RadioGroupItem value={plan.id} id={plan.id} className="opacity-0 absolute" />
                      <div className="relative">
                        <Circle className="w-5 h-5 text-muted-foreground" />
                        <Check className="w-3 h-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Passo 2: Confirme o plano
            </h3>
            {selectedPlan && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-black">{selectedPlan.plan_type}</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                <p className="text-sm font-semibold text-black">{formatPrice(selectedPlan.price)}</p>
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
                    Após a confirmação, você será redirecionado para a tela de pagamento.
                    Certifique-se de ter saldo suficiente para realizar o pagamento.
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
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-black">Dados para Pagamento via PIX</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm mb-2"><strong>Valor:</strong> {formatPrice(selectedPlan?.price || 0)}</p>
                <p className="text-sm mb-2"><strong>PIX:</strong> pix@suaempresa.com</p>
                <p className="text-sm text-muted-foreground">
                  Realize o PIX e confirme o pagamento abaixo
                </p>
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
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={confirming}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
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
