import { BubbleApiConfig, BubbleApiResponse, FetchResponse } from '../types/api';

export async function fetchBubbleData(config: BubbleApiConfig): Promise<FetchResponse> {
  const { baseUrl, apiKey, dataType } = config;
  
  // Remove /version-test if it exists at the end of the URL
  const cleanUrl = baseUrl.replace(/\/version-test\/?$/, '');
    
  const response = await fetch(
    `${cleanUrl}/version-test/api/1.1/obj/${dataType}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: BubbleApiResponse = await response.json();
  
  return {
    results: data.response.results,
    count: data.response.count,
    remaining: data.response.remaining,
    dataType
  };
}