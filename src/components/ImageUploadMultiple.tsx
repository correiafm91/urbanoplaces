
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadMultipleProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploadMultiple({ 
  images, 
  onImagesChange, 
  maxImages = 8 
}: ImageUploadMultipleProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxImages} imagens permitido`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} não é uma imagem válida`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} excede o limite de 5MB`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `listing-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Storage error:', error);
          throw error;
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.path);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);

      toast({
        title: "Sucesso",
        description: `${uploadedUrls.length} imagem(ns) enviada(s)`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload das imagens",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    // Clear the input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Imagem ${index + 1}`}
              className="w-full h-24 object-cover rounded border"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
            {uploading ? (
              <div className="text-xs text-muted-foreground">Enviando...</div>
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
              </>
            )}
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Máximo {maxImages} imagens. Cada imagem deve ter no máximo 5MB.
      </p>
    </div>
  );
}
