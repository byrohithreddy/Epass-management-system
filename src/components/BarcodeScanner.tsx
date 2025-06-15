import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScanResult, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanResult, setScanResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader>();

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isOpen]);

  const cleanup = () => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (err) {
        console.log('Reader cleanup error:', err);
      }
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsScanning(false);
    setError('');
    setScanResult('');
    setIsProcessing(false);
  };

  const initializeCamera = async () => {
    try {
      setError('');
      
      // Get available video devices
      const videoDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoDevices.filter(device => device.kind === 'videoinput');
      setDevices(cameras);
      
      if (cameras.length === 0) {
        setError('No cameras found on this device.');
        return;
      }

      // Prefer back camera for mobile devices
      const backCamera = cameras.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const deviceId = selectedDeviceId || backCamera?.deviceId || cameras[0].deviceId;
      setSelectedDeviceId(deviceId);
      
      await startCamera(deviceId);
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to initialize camera. Please check permissions.');
    }
  };

  const startCamera = async (deviceId: string) => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError('');

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera with specific constraints
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : { ideal: 'environment' }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      videoRef.current.srcObject = newStream;

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = resolve;
        }
      });

      // Initialize barcode reader
      readerRef.current = new BrowserMultiFormatReader();
      
      // Start continuous scanning
      readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result && !isProcessing) {
            const scannedText = result.getText();
            console.log('Barcode detected:', scannedText);
            setScanResult(scannedText);
            setIsProcessing(true);
            
            // Add a small delay to show the result before processing
            setTimeout(() => {
              try {
                onScanResult(scannedText);
                onClose();
              } catch (err) {
                console.error('Error processing scan result:', err);
                setError('Error processing scan result');
                setIsProcessing(false);
              }
            }, 1000);
          }
          
          if (error && !error.message.includes('No MultiFormat Readers')) {
            console.log('Scan error:', error);
          }
        }
      );

    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('Camera not found. Please ensure your device has a working camera.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application. Please close other apps and try again.');
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    setSelectedDeviceId(nextDeviceId);
    await startCamera(nextDeviceId);
  };

  const retryScanning = () => {
    cleanup();
    setTimeout(() => {
      initializeCamera();
    }, 500);
  };

  const handleManualInput = () => {
    const input = prompt('Enter Student ID manually:');
    if (input && input.trim()) {
      onScanResult(input.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Scan Student ID</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-3/4 h-1/2 flex items-center justify-center">
                {scanResult ? (
                  <div className="text-center text-white">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">Scanned: {scanResult}</p>
                    <p className="text-xs opacity-75">Processing...</p>
                  </div>
                ) : (
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-75" />
                    <p className="text-sm opacity-75">Position barcode here</p>
                  </div>
                )}
              </div>
            </div>
            
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 text-sm font-medium">Camera Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {/* Camera controls */}
            <div className="flex space-x-2">
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  disabled={!isScanning || isProcessing}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Switch Camera</span>
                </button>
              )}
              
              <button
                onClick={retryScanning}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
            
            {/* Manual input option */}
            <button
              onClick={handleManualInput}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Enter ID Manually
            </button>
            
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-medium text-sm mb-2">Scanning Tips:</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Hold the ID card steady within the frame</li>
              <li>• Ensure good lighting on the barcode</li>
              <li>• Keep the camera 6-12 inches from the barcode</li>
              <li>• Make sure the barcode is not blurry or damaged</li>
              <li>• Try the "Enter ID Manually" option if scanning fails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}