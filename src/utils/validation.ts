import { z } from 'zod';

const urlSchema = z.string().url().refine(
  (url) => url.includes('bubbleapps.io') || url.includes('bubble.io'),
  'URL must be a valid Bubble.io application URL'
);

const apiKeySchema = z.string().min(32, 'API key must be at least 32 characters long');

export function validateBubbleInputs(url: string, apiKey: string): { 
  isValid: boolean; 
  error?: string;
} {
  try {
    urlSchema.parse(url);
    apiKeySchema.parse(apiKey);
    return { isValid: true };
  } catch (err) {
    return { 
      isValid: false, 
      error: err instanceof z.ZodError ? err.errors[0].message : 'Invalid input'
    };
  }
}

export function formatBubbleUrl(url: string): string {
  // Remove whitespace
  let cleanUrl = url.trim();

  // Ensure URL has https://
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Parse URL to handle various formats
  try {
    const urlObj = new URL(cleanUrl);
    
    // Extract the base domain (e.g., "vault-30921.bubbleapps.io")
    const baseUrl = urlObj.hostname;
    
    // Remove any paths that shouldn't be there
    if (baseUrl.includes('bubbleapps.io') || baseUrl.includes('bubble.io')) {
      return `https://${baseUrl}`;
    }
    
    throw new Error('Invalid Bubble.io URL');
  } catch (error) {
    throw new Error('Please enter a valid Bubble.io application URL');
  }
}