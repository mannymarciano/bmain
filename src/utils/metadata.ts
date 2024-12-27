import { BubbleMetaResponse } from '../types/api';
import { validateBubbleInputs, formatBubbleUrl } from './validation';

export async function fetchBubbleMetadata(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    // Validate inputs
    const validation = validateBubbleInputs(baseUrl, apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Format URL
    const cleanUrl = formatBubbleUrl(baseUrl);
    const metaUrl = `${cleanUrl}/version-test/api/1.1/meta`;
    
    console.log('Fetching metadata from:', metaUrl); // Debug log

    const response = await fetch(metaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your credentials.');
      } else if (response.status === 404) {
        throw new Error('Application not found. Please check your Bubble.io URL.');
      } else {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
    }

    const data: BubbleMetaResponse = await response.json();
    
    if (!data.get || !Array.isArray(data.get)) {
      throw new Error('Invalid response format from Bubble.io API');
    }

    return data.get;
  } catch (error) {
    // Add request context to the error
    const message = error instanceof Error ? error.message : 'Failed to fetch metadata';
    throw new Error(`Bubble.io API Error: ${message}`);
  }
}