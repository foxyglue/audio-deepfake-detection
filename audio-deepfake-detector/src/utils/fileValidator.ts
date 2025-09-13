import { FileValidationResult } from '../types';

export const validateAudioFile = (file: File): FileValidationResult => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'audio/mpeg',
    'audio/wav', 
    'audio/mp3',
    'audio/m4a',
    'audio/ogg',
    'audio/flac',
    'audio/aac'
  ];
  
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  // Check MIME type
  const hasValidMimeType = allowedTypes.includes(file.type);
  
  // Check file extension as fallback
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidMimeType && !hasValidExtension) {
    return {
      isValid: false,
      error: 'Please upload a valid audio file (MP3, WAV, M4A, OGG, FLAC, AAC)'
    };
  }
  
  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};