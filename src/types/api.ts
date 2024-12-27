export interface DataType {
  name: string;
  isActive: boolean;
}

export interface MultiDataTypeState {
  url: string;
  apiKey: string;
  dataTypes: DataType[];
  format: 'json' | 'csv';
}

export interface BubbleEntity {
  _id: string;
  [key: string]: any;
}

export interface BubbleApiConfig {
  baseUrl: string;
  apiKey: string;
  dataType: string;
}

export interface BubbleApiResponse {
  response: {
    results: BubbleEntity[];
    count: number;
    remaining: number;
  };
}

export interface FetchResponse {
  results: BubbleEntity[];
  count: number;
  remaining: number;
  dataType: string;
}

export interface BubbleMetaResponse {
  get: string[];
}

export interface MetaScannerProps {
  url: string;
  apiKey: string;
  onScanComplete: (dataTypes: string[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}