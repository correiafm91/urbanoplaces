
export interface WatermarkOptions {
  text: string;
  listingId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
}

export const addWatermark = async (
  file: File, 
  options: WatermarkOptions
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      const fontSize = options.fontSize || Math.max(16, Math.min(img.width, img.height) * 0.03);
      const padding = options.padding || 20;
      const opacity = options.opacity || 0.7;
      const color = options.color || '#FFFFFF';
      const backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.5)';

      // Prepare watermark text
      const marketplaceName = 'AutoTrade';
      const watermarkText = options.listingId 
        ? `${marketplaceName} - ID: ${options.listingId}`
        : `${marketplaceName} - ${options.text}`;

      // Set font and measure text
      ctx.font = `bold ${fontSize}px Arial`;
      const textWidth = ctx.measureText(watermarkText).width;
      const textHeight = fontSize;

      // Calculate position
      let x, y;
      const position = options.position || 'bottom-right';
      
      switch (position) {
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case 'top-left':
          x = padding;
          y = textHeight + padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
        default:
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
      }

      // Draw background rectangle for better readability
      const bgPadding = 8;
      ctx.fillStyle = backgroundColor;
      ctx.globalAlpha = opacity;
      ctx.fillRect(
        x - bgPadding, 
        y - textHeight - bgPadding, 
        textWidth + (bgPadding * 2), 
        textHeight + (bgPadding * 2)
      );

      // Draw watermark text
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fillText(watermarkText, x, y);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new file with the same name and type
            const watermarkedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            reject(new Error('Failed to create watermarked image'));
          }
        },
        file.type,
        0.9
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

export const addWatermarkToMultipleImages = async (
  files: File[],
  options: WatermarkOptions
): Promise<File[]> => {
  const promises = files.map(file => addWatermark(file, options));
  return Promise.all(promises);
};
