
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  title?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function ImageCarousel({ 
  images, 
  title = "Imagem do veículo",
  currentIndex: externalIndex,
  onIndexChange 
}: ImageCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  
  // Use external index if provided, otherwise use internal
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  
  const handleIndexChange = (newIndex: number) => {
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Nenhuma imagem disponível</p>
      </div>
    );
  }

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    handleIndexChange(newIndex);
  };

  const prevImage = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    handleIndexChange(newIndex);
  };

  return (
    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`${title} - Imagem ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => handleIndexChange(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
