/**
 * Client-side image utilities.
 * Resize and crop images before storing as base64 data URLs in localStorage.
 */

const AVATAR_SIZE = 128;

/**
 * Load an image from a File and convert it to a square-cropped, resized
 * base64 data URL suitable for localStorage.
 *
 * @param {File} file - A file from an <input type="file"> element
 * @returns {Promise<string>} A base64 PNG data URL (128x128)
 */
export function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the image file.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load the image. The file may be corrupted.'));
      };

      img.onload = () => {
        try {
          // Create a square canvas at AVATAR_SIZE
          const canvas = document.createElement('canvas');
          canvas.width = AVATAR_SIZE;
          canvas.height = AVATAR_SIZE;
          const ctx = canvas.getContext('2d');

          // Compute a centered square crop from the source image
          const { width, height } = img;
          const minDim = Math.min(width, height);
          const sx = (width - minDim) / 2;
          const sy = (height - minDim) / 2;

          // Draw the cropped square into the canvas
          ctx.drawImage(
            img,
            sx, sy, minDim, minDim,
            0, 0, AVATAR_SIZE, AVATAR_SIZE
          );

          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(new Error('Failed to process the image.'));
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
