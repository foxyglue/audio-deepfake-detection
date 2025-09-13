import React, { useState, useCallback } from 'react';
import { Upload, FileAudio, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisStatus } from '../types';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  status: AnalysisStatus;
  progress: number;
  error: string | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileSelect,
  status,
  progress,
  error
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return progress < 50 ? 'Uploading file...' : 'Processing audio...';
      case 'processing':
        return 'Analyzing with AI model...';
      default:
        return 'Drop your audio file here';
    }
  };

  const isLoading = status === 'uploading' || status === 'processing';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
      <div
        className={`upload-area ${
          dragActive ? 'upload-area-active' : 'upload-area-inactive'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="space-y-6">
            <LoadingSpinner size={64} className="text-blue-500 mx-auto" />
            <div className="space-y-4">
              <p className="text-xl font-semibold text-gray-700">
                {getStatusMessage()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <FileAudio className="w-16 h-16 text-gray-400 mx-auto" />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">
                {getStatusMessage()}
              </h3>
              <p className="text-gray-500">
                or click to browse files
              </p>
              <p className="text-sm text-gray-400">
                Supports: MP3, WAV, M4A, OGG, FLAC, AAC (max 50MB)
              </p>
              <label className="gradient-button inline-flex items-center cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                Choose Audio File
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-semibold">Analysis Failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};