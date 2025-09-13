import React from 'react';
import { CheckCircle, AlertTriangle, Upload, Info, Clock, FileAudio } from 'lucide-react';
import { DetectionResult } from '../types';
import { formatFileSize } from '../utils/fileValidator';

interface ResultDisplayProps {
  result: DetectionResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const isDeepfake = result.is_deepfake;
  const confidencePercentage = (result.confidence * 100).toFixed(1);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600 bg-green-100';
    if (confidence > 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (confidence > 0.6) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Main Result */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
          isDeepfake ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {isDeepfake ? (
            <AlertTriangle className="w-12 h-12 text-red-500" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-3 ${
          isDeepfake ? 'text-red-600' : 'text-green-600'
        }`}>
          {isDeepfake ? '🚨 Deepfake Detected' : '✅ Authentic Audio'}
        </h2>
        
        <p className="text-gray-600 text-lg">
          {isDeepfake 
            ? 'This audio appears to be artificially generated or manipulated'
            : 'This audio appears to be genuine and unaltered'
          }
        </p>
      </div>

      {/* Confidence Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Confidence Score
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
            {confidencePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ease-out ${getConfidenceBarColor(result.confidence)}`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Higher confidence indicates more certainty in the prediction
        </p>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Processing Time
          </h3>
          <p className="text-2xl font-bold text-gray-800">
            {result.processing_time.toFixed(2)}s
          </p>
        </div>

        {result.model_version && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Model Version</h3>
            <p className="text-lg font-medium text-gray-800">
              {result.model_version}
            </p>
          </div>
        )}
      </div>

      {/* File Information */}
      {result.file_info && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FileAudio className="w-5 h-5 mr-2" />
            File Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Filename</span>
              <p className="font-medium truncate" title={result.file_info.name}>
                {result.file_info.name}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block">File Size</span>
              <p className="font-medium">{formatFileSize(result.file_info.size)}</p>
            </div>
            {result.file_info.duration && (
              <div>
                <span className="text-gray-500 block">Duration</span>
                <p className="font-medium">
                  {Math.floor(result.file_info.duration / 60)}:
                  {Math.floor(result.file_info.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onReset}
          className="gradient-button inline-flex items-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          Analyze Another File
        </button>
      </div>
    </div>
  );
};