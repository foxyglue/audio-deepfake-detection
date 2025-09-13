from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
import torchaudio
import librosa
import numpy as np
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
import tempfile
import time
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Audio Deepfake Detection API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class FileInfo(BaseModel):
    name: str
    size: int
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None

class DetectionResult(BaseModel):
    is_deepfake: bool
    confidence: float  # 0.0 to 1.0
    processing_time: float
    model_version: Optional[str] = "MelodyMachine/Deepfake-audio-detection-V2"
    file_info: Optional[FileInfo] = None

# Global model variables
model = None
feature_extractor = None
device = None

@app.on_event("startup")
async def load_model():
    """Load the model on startup"""
    global model, feature_extractor, device
    
    logger.info("Loading deepfake detection model...")
    
    try:
        # Set device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {device}")
        
        # Load model and feature extractor
        model_name = "MelodyMachine/Deepfake-audio-detection-V2"
        model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
        feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)
        
        model.to(device)
        model.eval()
        
        logger.info("Model loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise e

def preprocess_audio(audio_path: str, target_sampling_rate: int = 16000):
    """Preprocess audio file for model inference"""
    try:
        # Load audio file
        audio, sr = librosa.load(audio_path, sr=target_sampling_rate)
        
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio = librosa.to_mono(audio)
        
        # Normalize audio
        audio = librosa.util.normalize(audio)
        
        # Get audio info
        duration = len(audio) / sr
        
        return audio, sr, duration
        
    except Exception as e:
        logger.error(f"Error preprocessing audio: {e}")
        raise HTTPException(status_code=400, detail=f"Error processing audio file: {str(e)}")

def predict_deepfake(audio: np.ndarray, sampling_rate: int):
    """Predict if audio is deepfake using the loaded model"""
    try:
        # Extract features
        inputs = feature_extractor(
            audio, 
            sampling_rate=sampling_rate, 
            return_tensors="pt", 
            padding=True
        )
        
        # Move to device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        # Get prediction (assuming label 1 = deepfake, 0 = real)
        predicted_class = torch.argmax(logits, dim=-1).item()
        confidence = probabilities[0][predicted_class].item()
        
        is_deepfake = bool(predicted_class == 1)
        
        return is_deepfake, confidence
        
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Error during model inference: {str(e)}")

@app.post("/detect-deepfake", response_model=DetectionResult)
async def detect_deepfake(file: UploadFile = File(...)):
    """Main endpoint for deepfake detection"""
    start_time = time.time()
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Please upload a valid audio file")
    
    # Check if model is loaded
    if model is None or feature_extractor is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please try again later.")
    
    temp_path = None
    try:
        # Save uploaded file to temporary location
        file_content = await file.read()
        file_size = len(file_content)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
            temp_path = temp_file.name
            temp_file.write(file_content)
        
        # Preprocess audio
        audio, sampling_rate, duration = preprocess_audio(temp_path)
        
        # Make prediction
        is_deepfake, confidence = predict_deepfake(audio, sampling_rate)
        
        processing_time = time.time() - start_time
        
        # Determine number of channels from original file
        try:
            info = torchaudio.info(temp_path)
            channels = info.num_channels
            original_sr = info.sample_rate
        except:
            channels = 1
            original_sr = sampling_rate
        
        result = DetectionResult(
            is_deepfake=is_deepfake,
            confidence=confidence,
            processing_time=processing_time,
            file_info=FileInfo(
                name=file.filename,
                size=file_size,
                duration=duration,
                sample_rate=original_sr,
                channels=channels
            )
        )
        
        logger.info(f"Prediction: {'Deepfake' if is_deepfake else 'Real'} (confidence: {confidence:.3f})")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during processing")
    
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not_loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "device": str(device) if device else "unknown"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Audio Deepfake Detection API", 
        "model": "MelodyMachine/Deepfake-audio-detection-V2",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)