
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

export function ProfileImageUpload({ currentImage, onImageChange }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // For now, we'll create a mock URL. In a real implementation, 
      // you would upload to a storage service like Supabase Storage
      const mockImageUrl = URL.createObjectURL(file);
      onImageChange(mockImageUrl);
      
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <label htmlFor="profile-image" className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            className="rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Clique no botão para adicionar uma foto de perfil
      </p>
    </div>
  );
}
