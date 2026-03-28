import React, { useState } from 'react';
import { Mail, Bug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function EmailDebug() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Array<{step: string, status: 'success' | 'error', message: string}>>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    const addResult = (step: string, status: 'success' | 'error', message: string) => {
      setResults(prev => [...prev, { step, status, message }]);
    };

    try {
      // Step 1: Check if EmailJS is loaded
      addResult('EmailJS Library', 'success', 'EmailJS library is loaded');
      
      // Step 2: Check configuration
      const config = {
        serviceId: 'service_2ndwaxr',
        templateId: 'template_umv60te',
        publicKey: 'SFiccr27BNUy-T3Ah'
      };
      
      addResult('Configuration', 'success', `Service: ${config.serviceId}, Template: ${config.templateId}, Key: ${config.publicKey.substring(0, 10)}...`);

      // Step 3: Initialize EmailJS
      try {
        emailjs.init(config.publicKey);
        addResult('EmailJS Initialization', 'success', 'EmailJS initialized successfully');
      } catch (error) {
        addResult('EmailJS Initialization', 'error', `Failed to initialize: ${error.message}`);
        return;
      }

      // Step 4: Test email sending
      const testParams = {
        to_email: 'mrcet9177@gmail.com',
        student_id: 'TEST123',
        section: 'CSE-A',
        department: 'Computer Science',
        leave_datetime: new Date().toLocaleString(),
        return_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString(),
        description: 'This is a test email from the debug component',
        submitted_at: new Date().toLocaleString(),
        subject: 'Test Gatepass Request - TEST123',
      };

      addResult('Test Parameters', 'success', 'Test parameters prepared');

      try {
        const response = await emailjs.send(
          config.serviceId,
          config.templateId,
          testParams,
          config.publicKey
        );
        
        addResult('Email Sending', 'success', `Email sent successfully! Response: ${JSON.stringify(response)}`);
      } catch (error) {
        addResult('Email Sending', 'error', `Failed to send email: ${error.message}`);
        
        // Additional error details
        if (error.text) {
          addResult('Error Details', 'error', `Error text: ${error.text}`);
        }
        if (error.status) {
          addResult('Error Status', 'error', `HTTP Status: ${error.status}`);
        }
      }

    } catch (error) {
      addResult('General Error', 'error', `Unexpected error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Bug className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Debug Tool</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        This tool will help diagnose why email notifications aren't working.
      </p>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {testing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Running Diagnostics...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Bug className="h-4 w-4" />
            <span>Run Email Diagnostics</span>
          </div>
        )}
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Diagnostic Results:</h4>
          {results.map((result, index) => (
            <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
              result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {result.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">{result.step}:</span>
              <span className="text-sm">{result.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Troubleshooting Tips:</p>
            <ul className="mt-1 space-y-1">
              <li>• Check browser console for detailed error messages</li>
              <li>• Verify EmailJS service and template IDs are correct</li>
              <li>• Ensure your EmailJS account is active and verified</li>
              <li>• Check if there are any CORS or network issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 