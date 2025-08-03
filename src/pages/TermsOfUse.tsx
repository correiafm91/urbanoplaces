import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: Janeiro 2024</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ao utilizar o Urbano.bikes, você concorda com estes termos de uso. Se não concordar, não utilize nossos serviços.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p>O Urbano.bikes é uma plataforma digital que conecta compradores e vendedores de veículos, facilitando transações seguras.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Responsabilidades do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Não publicar anúncios fraudulentos ou enganosos</li>
                <li>Respeitar outros usuários da plataforma</li>
                <li>Cumprir toda legislação aplicável</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>O Urbano.bikes facilita o contato entre usuários, mas não participa diretamente das transações. Usuários são responsáveis por suas negociações.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Planos e Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Planos de destaque são válidos por 30 dias</li>
                <li>Anúncios gratuitos: 1 por usuário</li>
                <li>Pagamentos via PIX são processados instantaneamente</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p>O Urbano.bikes não se responsabiliza por danos decorrentes do uso da plataforma ou de transações entre usuários.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}