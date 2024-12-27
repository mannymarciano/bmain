import { validateBubbleCredentials, formatBubbleUrl } from '../validation/bubbleValidation';
import { BubbleMetaResponse } from '../../types/api';

export async function fetchBubbleMetadata(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    // Validate credentials first
    const validation = validateBubbleCredentials(baseUrl, apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid credentials');
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
      const errorText = await response.text();
      switch (response.status) {
        case 401:
          throw new Error('Invalid API key. Please check your credentials.');
        case 403:
          throw new Error('Access forbidden. Please check your API permissions.');
        case 404:
          throw new Error('Application not found. Please check your Bubble.io URL.');
        default:
          throw new Error(`API Error (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from Bubble.io API');
    }

    if (!data.get || !Array.isArray(data.get)) {
      throw new Error('No data types found in response');
    }

    if (data.get.length === 0) {
      throw new Error('No data types available in the application');
    }

    return data.get;
  } catch (error) {
    console.error('Bubble.io API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch metadata');
  }
}