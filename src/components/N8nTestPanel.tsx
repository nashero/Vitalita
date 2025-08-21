import React, { useState } from 'react';
import { TestTube, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CHAT_CONFIG } from '../config/chat';

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
  timestamp: Date;
}

const N8nTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testMessage, setTestMessage] = useState('Test message from Vitalita');
  const [webhookUrl, setWebhookUrl] = useState(CHAT_CONFIG.n8nWebhookUrl);

  const addTestResult = (success: boolean, message: string, details?: string) => {
    const result: TestResult = {
      success,
      message,
      details,
      timestamp: new Date()
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testBasicConnectivity = async () => {
    setIsTesting(true);
    addTestResult(false, 'Testing basic connectivity...');

    try {
      console.log('🧪 Testing basic connectivity to:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage,
          timestamp: new Date().toISOString(),
          sessionId: 'test-basic-' + Date.now(),
          source: 'n8n-test-panel',
          test: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(true, '✅ Basic connectivity test passed', 
          `Status: ${response.status}, Response: ${JSON.stringify(data).substring(0, 100)}...`);
        console.log('✅ Basic connectivity test passed:', data);
      } else {
        addTestResult(false, '❌ Basic connectivity test failed', 
          `Status: ${response.status} ${response.statusText}`);
        console.error('❌ Basic connectivity test failed:', response.status, response.statusText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(false, '❌ Basic connectivity test failed', errorMessage);
      console.error('❌ Basic connectivity test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const testCORS = async () => {
    setIsTesting(true);
    addTestResult(false, 'Testing CORS preflight...');

    try {
      console.log('🔍 Testing CORS preflight to:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      addTestResult(true, '✅ CORS preflight test completed', 
        `Status: ${response.status}, Headers: ${Object.fromEntries(response.headers.entries())}`);
      console.log('✅ CORS preflight test completed:', response.status);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(false, '❌ CORS preflight test failed', errorMessage);
      console.error('❌ CORS preflight test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const testVoiceAgent = async () => {
    setIsTesting(true);
    addTestResult(false, 'Testing VoiceAgent integration...');

    try {
      // Simulate what VoiceAgent would send
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage,
          timestamp: new Date().toISOString(),
          sessionId: `vitalita-vapi-voice-${Date.now()}`,
          userAgent: navigator.userAgent,
          source: 'vitalita-vapi-voice-agent',
          inputType: 'voice',
          context: {
            platform: 'vitalita-web',
            component: 'voice-agent',
            inputMethod: 'voice'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(true, '✅ VoiceAgent integration test passed', 
          `Status: ${response.status}, Response: ${JSON.stringify(data).substring(0, 100)}...`);
        console.log('✅ VoiceAgent integration test passed:', data);
      } else {
        addTestResult(false, '❌ VoiceAgent integration test failed', 
          `Status: ${response.status} ${response.statusText}`);
        console.error('❌ VoiceAgent integration test failed:', response.status, response.statusText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(false, '❌ VoiceAgent integration test failed', errorMessage);
      console.error('❌ VoiceAgent integration test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const testChatWidget = async () => {
    setIsTesting(true);
    addTestResult(false, 'Testing ChatWidget integration...');

    try {
      // Simulate what ChatWidget would send
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage,
          timestamp: new Date().toISOString(),
          sessionId: 'vitalita-chat-' + Date.now(),
          userAgent: navigator.userAgent,
          source: 'vitalita-chat-widget',
          inputType: 'text',
          context: {
            platform: 'vitalita-web',
            component: 'chat-widget',
            inputMethod: 'text'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(true, '✅ ChatWidget integration test passed', 
          `Status: ${response.status}, Response: ${JSON.stringify(data).substring(0, 100)}...`);
        console.log('✅ ChatWidget integration test passed:', data);
      } else {
        addTestResult(false, '❌ ChatWidget integration test failed', 
          `Status: ${response.status} ${response.statusText}`);
        console.error('❌ ChatWidget integration test failed:', response.status, response.statusText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(false, '❌ ChatWidget integration test failed', errorMessage);
      console.error('❌ ChatWidget integration test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <>
      {/* Test Panel Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
          title="Open n8n Test Panel"
        >
          <TestTube className="w-5 h-5" />
        </button>
      )}

      {/* Test Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">n8n Integration Test Panel</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              title="Close test panel"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Configuration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                n8n Webhook URL:
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter n8n webhook URL"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                Test Message:
              </label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter test message"
              />
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={testBasicConnectivity}
                disabled={isTesting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
              >
                Test Basic
              </button>
              <button
                onClick={testCORS}
                disabled={isTesting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
              >
                Test CORS
              </button>
              <button
                onClick={testVoiceAgent}
                disabled={isTesting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
              >
                Test VoiceAgent
              </button>
              <button
                onClick={testChatWidget}
                disabled={isTesting}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
              >
                Test ChatWidget
              </button>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Test Results:</h4>
                <button
                  onClick={clearResults}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-xs ${
                      result.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.message}</div>
                        {result.details && (
                          <div className="text-gray-600 mt-1">{result.details}</div>
                        )}
                        <div className="text-gray-500 mt-1">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {testResults.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No test results yet. Run a test to see results here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default N8nTestPanel;
