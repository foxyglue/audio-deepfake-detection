import axios, { AxiosProgressEvent } from 'axios';
import { DetectionResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_BASE_URL;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async detectDeepfake(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${this.baseURL}/detect-deepfake`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && onProgress) {
              const uploadProgress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 50 // Upload is 50% of total
              );
              onProgress(uploadProgress);
            }
          },
          timeout: 300000, // 5 minutes timeout
        }
      );

      // Simulate processing progress
      if (onProgress) {
        onProgress(75);
        setTimeout(() => onProgress(100), 500);
      }

      return {
        ...response.data,
        file_info: {
          name: file.name,
          size: file.size,
          ...response.data.file_info
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. The file might be too large or the server is busy.');
        }
        throw new Error(
          error.response?.data?.detail || 
          error.message ||
          'Failed to analyze audio file'
        );
      }
      throw new Error('Network error occurred. Please check your connection.');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = ApiService.getInstance();