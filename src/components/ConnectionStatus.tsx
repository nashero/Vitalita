import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../lib/supabase';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const testConnection = async () => {
    setStatus('testing');
    setError('');
    setDetails('Testing connection...');

    try {
      const result = await testSupabaseConnection();
      
      if (result.success) {
        setStatus('connected');
        setDetails('Database connection successful');
      } else {
        setStatus('failed');
        setError(result.error?.toString() || 'Unknown error');
        setDetails('Connection failed');
      }
    } catch (err) {
      setStatus('failed');
      setError(err?.toString() || 'Unknown error');
      setDetails('Connection test failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className={`border rounded-lg p-3 shadow-lg ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <div className="font-semibold text-sm">
                {status === 'testing' && 'Testing Connection...'}
                {status === 'connected' && 'Connected'}
                {status === 'failed' && 'Connection Failed'}
              </div>
              <div className="text-xs opacity-75">{details}</div>
            </div>
          </div>
          <button
            onClick={testConnection}
            className="text-xs px-2 py-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            title="Retest connection"
          >
            Retest
          </button>
        </div>
        
        {status === 'failed' && error && (
          <div className="mt-2 text-xs">
            <details>
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <div className="mt-1 p-2 bg-black bg-opacity-10 rounded text-xs font-mono break-all">
                {error}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus; 