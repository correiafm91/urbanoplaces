import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, HandHeart, AlertTriangle, CheckCircle, Phone } from "lucide-react";

export default function SafetyTips() {
  const tips = [
    {
      icon: Eye,
      title: "Encontro presencial obrigatório",
      description: "Sempre veja o veículo pessoalmente antes de fechar negócio. Não compre sem fazer uma inspeção completa."
    },
    {
      icon: Shield,
      title: "Verifique a documentação",
      description: "Confirme se todos os documentos estão em ordem: CRLV, nota fiscal, histórico de multas e débitos."
    },
    {
      icon: HandHeart,
      title: "Local seguro para encontros",
      description: "Prefira locais públicos e movimentados. Evite lugares isolados e sempre avise alguém sobre o encontro."
    },
    {
      icon: CheckCircle,
      title: "Teste antes de comprar",
      description: "Faça um test drive completo. Verifique freios, motor, suspensão e todos os componentes importantes."
    },
    {
      icon: AlertTriangle,
      title: "Desconfie de preços muito baixos",
      description: "Preços muito abaixo do mercado podem indicar problemas ou golpes. Pesquise a fipe antes de comprar."
    },
    {
      icon: Phone,
      title: "Histórico de manutenção",
      description: "Peça o histórico de manutenção e revisões. Um veículo bem cuidado tem maior durabilidade."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Dicas de Segurança</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sua segurança é nossa prioridade. Siga estas dicas para comprar e vender com tranquilidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ Sinais de Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <ul className="space-y-2">
              <li>• Vendedor não permite inspeção detalhada</li>
              <li>• Pressa excessiva para fechar negócio</li>
              <li>• Documentação incompleta ou suspeita</li>
              <li>• Pagamento apenas via transferência bancária</li>
              <li>• Preços muito abaixo da tabela FIPE</li>
              <li>• Não aceita teste ou inspeção por mecânico</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              ✅ Boas Práticas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-600 dark:text-green-300">
            <ul className="space-y-2">
              <li>• Leve um mecânico de confiança na inspeção</li>
              <li>• Faça uma consulta de chassi no Detran</li>
              <li>• Negocie sempre pessoalmente</li>
              <li>• Use formas de pagamento seguras</li>
              <li>• Transfira a propriedade imediatamente</li>
              <li>• Guarde todos os comprovantes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}