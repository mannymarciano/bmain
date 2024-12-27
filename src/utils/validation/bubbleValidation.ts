import { z } from 'zod';

// Schema for Bubble.io URL validation
export const bubbleUrlSchema = z.string()
  .min(1, 'Bubble.io URL is required')
  .url('Please enter a valid URL')
  .refine(
    (url) => url.includes('bubbleapps.io') || url.includes('bubble.io'),
    'URL must be a valid Bubble.io application URL'
  );

// Schema for API key validation
export const bubbleApiKeySchema = z.string()
  .min(1, 'API key is required')
  .min(32, 'API key must be at least 32 characters long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'API key contains invalid characters');

// Validate both URL and API key together
export function validateBubbleCredentials(url: string | null | undefined, apiKey: string | null | undefined) {
  if (!url || !apiKey) {
    return { 
      isValid: false, 
      error: 'Both Bubble.io URL and API key are required' 
    };
  }

  try {
    bubbleUrlSchema.parse(url);
    bubbleApiKeySchema.parse(apiKey);
    return { isValid: true, error: null };
  } catch (err) {
    return { 
      isValid: false, 
      error: err instanceof z.ZodError ? err.errors[0].message : 'Invalid credentials'
    };
  }
}

// Format Bubble.io URL to ensure consistency
export function formatBubbleUrl(url: string): string {
  if (!url) {
    throw new Error('Bubble.io URL is required');
  }

  // Remove whitespace
  let cleanUrl = url.trim();

  // Ensure URL has https://
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const urlObj = new URL(cleanUrl);
    return `https://${urlObj.hostname}`;
  } catch (error) {
    throw new Error('Please enter a valid Bubble.io application URL');
  }
}