import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScanResult, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const readerRef = useRef<BrowserMultiFormatReader>();

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    }
    
    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.stopContinuousDecode();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError('');
      
      readerRef.current = new BrowserMultiFormatReader();
      
      const result = await readerRef.current.decodeOnceFromVideoDevice(
        undefined,
        videoRef.current
      );
      
      if (result) {
        onScanResult(result.getText());
        onClose();
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found. Please ensure your device has a camera.');
      } else {
        setError('Failed to scan barcode. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan Student ID</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
              muted
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={startScanning}
              disabled={isScanning}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}