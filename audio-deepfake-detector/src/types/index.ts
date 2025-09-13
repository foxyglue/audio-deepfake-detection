export interface DetectionResult {
  is_deepfake: boolean;
  confidence: number;
  processing_time: number;
  model_version?: string;
  file_info?: {
    name: string;
    size: number;
    duration?: number;
    sample_rate?: number;
    channels?: number;
  };
}

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  result: DetectionResult | null;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';