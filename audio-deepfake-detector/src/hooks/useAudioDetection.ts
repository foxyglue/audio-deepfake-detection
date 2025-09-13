import { useState, useCallback } from 'react';
import { UploadState, AnalysisStatus } from '../types';
import { apiService } from '../services/api';
import { validateAudioFile } from '../utils/fileValidator';

export const useAudioDetection = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    result: null
  });

  const [status, setStatus] = useState<AnalysisStatus>('idle');

  const detectDeepfake = useCallback(async (file: File) => {
    // Validate file first
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      setStatus('error');
      return;
    }

    // Reset state
    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      result: null
    });
    setStatus('uploading');

    try {
      const result = await apiService.detectDeepfake(
        file,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
          if (progress >= 50) {
            setStatus('processing');
          }
        }
      );

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        result
      });
      setStatus('completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        result: null
      });
      setStatus('error');
    }
  }, []);

  const resetState = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      result: null
    });
    setStatus('idle');
  }, []);

  return {
    uploadState,
    status,
    detectDeepfake,
    resetState
  };
};