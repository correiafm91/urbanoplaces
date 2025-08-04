
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function ImageCarousel({ images, title, currentIndex, onIndexChange }: ImageCarouselProps) {
  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onIndexChange(newIndex);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Sem imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
      <img
        src={images[currentIndex]}
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
