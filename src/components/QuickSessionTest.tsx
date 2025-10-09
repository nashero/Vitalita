/**
 * Quick Session Test Component
 * 
 * A simple component to test session functionality
 */

import React, { useState } from 'react';
import { hasAnyActiveSession, createPinSession, clearPinSession } from '../utils/sessionManager';

export default function QuickSessionTest() {
  const [result, setResult] = useState<string>('');

  const testSession = () => {
    const hasSession = hasAnyActiveSession();
    setResult(`Session check: ${hasSession ? 'ACTIVE' : 'NO SESSION'}`);
  };

  const createTestSession = () => {
    createPinSession('test-donor-123', 'test-hash-456');
    setResult('Test session created');
  };

  const clearTestSession = () => {
    clearPinSession();
    setResult('Session cleared');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Quick Session Test</h3>
      <div className="space-y-2">
        <button 
          onClick={testSession}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check Session
        </button>
        <button 
          onClick={createTestSession}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Test Session
        </button>
        <button 
          onClick={clearTestSession}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Session
        </button>
        {result && (
          <div className="p-2 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
