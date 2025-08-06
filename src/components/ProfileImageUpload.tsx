
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `profile/${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro no upload: ' + uploadError.message);
      }

      console.log('Upload successful:', data);

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      console.log('Public URL:', urlData.publicUrl);

      onImageChange(urlData.publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada",
      });
    } catch (error: any) {
      console.error('Complete upload error:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
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
              onError={(e) => {
                console.error('Error loading profile image:', currentImage);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <label htmlFor="profile-image" className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            className="rounded-full w-8 h-8 p-0"
            style={{ backgroundColor: '#FFCD44', color: 'black' }}
            disabled={uploading}
            type="button"
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCD44'}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {uploading ? "Enviando..." : "Clique no botão para adicionar uma foto de perfil"}
      </p>
    </div>
  );
}
