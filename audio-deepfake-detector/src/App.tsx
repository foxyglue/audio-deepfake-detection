import { useState, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { useAudioDetection } from './hooks/useAudioDetection';
import { apiService } from './services/api';
import { Wifi, WifiOff } from 'lucide-react';

function App() {
  const { uploadState, status, detectDeepfake, resetState } = useAudioDetection();
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const isOnline = await apiService.healthCheck();
        setIsServerOnline(isOnline);
      } catch {
        setIsServerOnline(false);
      }
    };

    checkServerHealth();
    
    // Check server health every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (file: File) => {
    detectDeepfake(file);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #faf5ff 100%)' 
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>🎵</span>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Audio Deepfake Detector
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                AI-powered authenticity verification
              </p>
            </div>
          </div>
          
          {/* Server Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isServerOnline === null ? (
              <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #6b7280',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                <span style={{ fontSize: '14px' }}>Checking...</span>
              </div>
            ) : isServerOnline ? (
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <Wifi size={16} style={{ marginRight: '4px' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Server Online</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', color: '#dc2626' }}>
                <WifiOff size={16} style={{ marginRight: '4px' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Server Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Hero Section */}
        {status === 'idle' && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Detect AI-Generated Audio
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '512px',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>
              Upload an audio file to analyze whether it's authentic or created using 
              artificial intelligence. Our advanced machine learning model can detect 
              deepfake audio with high accuracy.
            </p>
            
            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ fontSize: '24px' }}>🤖</span>
                </div>
                <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>AI-Powered</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Advanced neural networks trained on millions of audio samples
                </p>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ fontSize: '24px' }}>⚡</span>
                </div>
                <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Fast Analysis</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Get results in seconds with real-time processing
                </p>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ fontSize: '24px' }}>🔒</span>
                </div>
                <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Privacy First</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Your files are processed securely and not stored
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Offline Warning */}
        {isServerOnline === false && (
          <div style={{
            backgroundColor: '#fefce8',
            borderLeft: '4px solid #facc15',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flexShrink: 0 }}>
                <WifiOff size={20} style={{ color: '#eab308' }} />
              </div>
              <div style={{ marginLeft: '12px' }}>
                <p style={{ fontSize: '14px', color: '#a16207' }}>
                  <strong>Server Unavailable:</strong> The FastAPI backend server is not responding. 
                  Please make sure your server is running on{' '}
                  <code style={{
                    backgroundColor: '#fef3c7',
                    color: '#a16207',
                    padding: '0 4px',
                    borderRadius: '4px'
                  }}>http://localhost:8000</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload or Results */}
        {!uploadState.result ? (
          <AudioUploader
            onFileSelect={handleFileSelect}
            status={status}
            progress={uploadState.progress}
            error={uploadState.error}
          />
        ) : (
          <ResultDisplay
            result={uploadState.result}
            onReset={resetState}
          />
        )}

        {/* How it Works Section */}
        {status === 'idle' && (
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              How It Works
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>1</span>
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Upload</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Select your audio file from your device
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>2</span>
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Analyze</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  AI model processes audio features and patterns
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>3</span>
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Detect</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Advanced algorithms identify synthetic markers
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#ec4899',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>4</span>
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Results</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Get detailed analysis with confidence score
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e5e7eb',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            Powered by advanced machine learning • Privacy-focused analysis
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;