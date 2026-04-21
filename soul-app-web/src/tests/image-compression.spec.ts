import { test, expect } from '@playwright/test';

test.describe('Image Compression Utility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a blank page or any page to run our utility
    await page.goto('/');
  });

  test('should compress a large image to under 1MB', async ({ page }) => {
    // We'll use the page.evaluate to run our utility in the browser context
    const result = await page.evaluate(async () => {
      // Import the utility dynamically
      // @ts-ignore
      const { compressImage } = await import('/src/utils/imageUtils.ts');

      // Create a large dummy image (canvas)
      const canvas = document.createElement('canvas');
      canvas.width = 5000;
      canvas.height = 5000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 5000, 5000);
        // Add some noise to make it less compressible
        for (let i = 0; i < 5000; i++) {
          ctx.fillStyle = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
          ctx.fillRect(Math.random()*5000, Math.random()*5000, 100, 100);
        }
      }

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve as any, 'image/jpeg', 1.0));
      const largeFile = new File([blob], 'large-image.jpg', { type: 'image/jpeg' });
      const originalSize = largeFile.size;

      const compressedFile = await compressImage(largeFile);

      return {
        originalSize,
        compressedSize: compressedFile.size,
        type: compressedFile.type,
        name: compressedFile.name
      };
    });

    console.log(`Original size: ${(result.originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed size: ${(result.compressedSize / 1024 / 1024).toFixed(2)} MB`);

    // Check if original was large (it might not be 8MB with just a solid color, but it should be significant)
    // Actually, 4000x3000 noise should be pretty big.

    expect(result.compressedSize).toBeLessThan(1 * 1024 * 1024);
    expect(result.type).toBe('image/jpeg');
  });

  test('should fallback for GIF files', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { compressImage } = await import('/src/utils/imageUtils.ts');
      const gifBlob = new Blob(['fake-gif-content'], { type: 'image/gif' });
      const gifFile = new File([gifBlob], 'test.gif', { type: 'image/gif' });

      const compressedFile = await compressImage(gifFile);
      return {
        size: compressedFile.size,
        type: compressedFile.type
      };
    });

    expect(result.type).toBe('image/gif');
    expect(result.size).toBe(new Blob(['fake-gif-content']).size);
  });

  test('should fallback for small files', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { compressImage } = await import('/src/utils/imageUtils.ts');
      const smallBlob = new Blob(['small'], { type: 'image/jpeg' });
      const smallFile = new File([smallBlob], 'small.jpg', { type: 'image/jpeg' });

      const compressedFile = await compressImage(smallFile);
      return {
        size: compressedFile.size
      };
    });

    expect(result.size).toBe(new Blob(['small']).size);
  });
});
