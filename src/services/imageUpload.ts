/**
 * Utility for image compression and conversion to Base64 Data URLs
 * for secure local storage and offline persistence in CardioVault.
 */

export async function compressAndReadFileAsDataUrl(
  file: File,
  maxDimension = 1400,
  quality = 0.8
): Promise<{ dataUrl: string; name: string; size: number; type: string }> {
  return new Promise((resolve, reject) => {
    // If it's a PDF or non-image, read directly as data URL without canvas compression
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URL if canvas 2d context fails
          resolve({
            dataUrl: e.target?.result as string,
            name: file.name,
            size: file.size,
            type: file.type,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name,
          size: Math.round((compressedDataUrl.length * 3) / 4),
          type: file.type || 'image/jpeg',
        });
      };

      img.onerror = () => {
        // Fallback to raw data url
        resolve({
          dataUrl: e.target?.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
