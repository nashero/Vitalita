import React, { useState } from 'react';
import { hasValidPinData } from '../utils/pinStorage';

export default function PinSimpleTest() {
  const [result, setResult] = useState<string>('Click to test');
  const [isLoading, setIsLoading] = useState(false);

  const testHasValidPinData = async () => {
    setIsLoading(true);
    try {
      const hasPin = await hasValidPinData();
      setResult(`hasValidPinData result: ${hasPin}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Simple PIN Test</h3>
      <button
        onClick={testHasValidPinData}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Testing...' : 'Test hasValidPinData'}
      </button>
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <pre>{result}</pre>
      </div>
    </div>
  );
}
