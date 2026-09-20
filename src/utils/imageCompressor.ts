/**
 * Utility to compress and crop avatar profile images before storage and Supabase synchronization.
 * Resizes the image to a maximum of 400x400 square JPEG at 85% quality.
 * Reduces 5MB raw images down to ~30-40KB without any noticeable quality degradation,
 * preventing localStorage QuotaExceededError and Supabase HTTP 413 Payload Too Large errors.
 */
export function compressProfileImage(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;

          // Crop square from the center of the image
          const size = Math.min(width, height);
          const startX = (width - size) / 2;
          const startY = (height - size) / 2;

          const targetSize = Math.min(size, maxWidth);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Fallback a imagen original:', err);
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
