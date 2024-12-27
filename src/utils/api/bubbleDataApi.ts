import { BubbleApiConfig, BubbleApiResponse } from '../../types/api';
import { formatBubbleUrl } from '../validation/bubbleValidation';

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 200;

export async function fetchBubbleData(config: BubbleApiConfig): Promise<BubbleApiResponse['response']> {
  const { baseUrl, apiKey, dataType } = config;
  const results: any[] = [];
  let cursor = 0;
  let hasMore = true;
  let retryCount = 0;

  const cleanUrl = formatBubbleUrl(baseUrl);

  while (hasMore && retryCount < MAX_RETRIES) {
    try {
      await delay(RATE_LIMIT_DELAY);

      const url = new URL(`${cleanUrl}/version-test/api/1.1/obj/${dataType}`);
      url.searchParams.set('cursor', cursor.toString());
      url.searchParams.set('limit', BATCH_SIZE.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${await response.text()}`);
      }

      const data: BubbleApiResponse = await response.json();
      results.push(...data.response.results);
      
      hasMore = data.response.remaining > 0;
      cursor += data.response.results.length;
      retryCount = 0;
    } catch (error) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        throw error;
      }
      await delay(Math.pow(2, retryCount) * 1000);
    }
  }

  return {
    results,
    count: results.length,
    remaining: 0
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));