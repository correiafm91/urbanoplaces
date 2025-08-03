import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface City {
  id: string;
  name: string;
  state: string;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  cities: City[];
  onVerificationComplete: () => void;
}

const pfSchema = z.object({
  user_type: z.literal("pf"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  city_id: z.string().min(1, "Cidade é obrigatória"),
});

const pjSchema = z.object({
  user_type: z.literal("pj"),
  razao_social: z.string().min(2, "Razão social deve ter pelo menos 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").max(18, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  city_id: z.string().min(1, "Cidade é obrigatória"),
  instagram: z.string().optional(),
});

export function VerificationModal({ isOpen, onClose, user, cities, onVerificationComplete }: VerificationModalProps) {
  const [step, setStep] = useState<"choice" | "pf" | "pj">("choice");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const pfForm = useForm<z.infer<typeof pfSchema>>({
    resolver: zodResolver(pfSchema),
    defaultValues: {
      user_type: "pf",
      full_name: "",
      cpf: "",
      phone: "",
      city_id: "",
    },
  });

  const pjForm = useForm<z.infer<typeof pjSchema>>({
    resolver: zodResolver(pjSchema),
    defaultValues: {
      user_type: "pj",
      razao_social: "",
      cnpj: "",
      phone: "",
      city_id: "",
      instagram: "",
    },
  });

  const handleUserTypeChoice = (type: "pf" | "pj") => {
    setStep(type);
  };

  const onSubmitPF = async (values: z.infer<typeof pfSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: values.user_type,
          full_name: values.full_name,
          cpf: values.cpf,
          phone: values.phone,
          city_id: values.city_id,
          is_verified: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Verificação concluída!",
        description: "Agora você pode anunciar na plataforma.",
      });

      onVerificationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPJ = async (values: z.infer<typeof pjSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: values.user_type,
          razao_social: values.razao_social,
          cnpj: values.cnpj,
          phone: values.phone,
          city_id: values.city_id,
          instagram: values.instagram,
          is_verified: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Verificação concluída!",
        description: "Agora você pode anunciar na plataforma.",
      });

      onVerificationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conclua seu cadastro para anunciar</DialogTitle>
          <DialogDescription>
            Escolha seu tipo de conta para continuar
          </DialogDescription>
        </DialogHeader>

        {step === "choice" && (
          <div className="space-y-4">
            <Button
              onClick={() => handleUserTypeChoice("pf")}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Sou Pessoa Física
            </Button>
            <Button
              onClick={() => handleUserTypeChoice("pj")}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Sou Pessoa Jurídica
            </Button>
          </div>
        )}

        {step === "pf" && (
          <Form {...pfForm}>
            <form onSubmit={pfForm.handleSubmit(onSubmitPF)} className="space-y-4">
              <FormField
                control={pfForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pfForm.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pfForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pfForm.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choice")}
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Concluir"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === "pj" && (
          <Form {...pjForm}>
            <form onSubmit={pjForm.handleSubmit(onSubmitPJ)} className="space-y-4">
              <FormField
                control={pjForm.control}
                name="razao_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pjForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pjForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pjForm.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pjForm.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@suaempresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choice")}
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Concluir"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}