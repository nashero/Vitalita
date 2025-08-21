// Test script to verify n8n webhook connectivity
// Run this in the browser console to test the connection

const testN8nWebhook = async () => {
  const n8nWebhookUrl = 'http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f';
  
  console.log('🧪 Testing n8n webhook connectivity...');
  console.log('Webhook URL:', n8nWebhookUrl);
  
  try {
    const requestBody = {
      message: 'Test connection from browser console',
      timestamp: new Date().toISOString(),
      sessionId: 'test-console-' + Date.now(),
      userAgent: navigator.userAgent,
      source: 'browser-console-test',
      inputType: 'text',
      context: {
        platform: 'browser-console',
        component: 'test',
        inputMethod: 'text'
      }
    };

    console.log('📤 Sending test request...');
    console.log('Request body:', requestBody);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response data:', data);
      
      if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0].output === 'string') {
        console.log('✅ Processed response:', data[0].output);
      } else if (typeof data === 'object' && data !== null && typeof data.output === 'string') {
        console.log('✅ Processed response:', data.output);
      } else if (typeof data === 'string') {
        console.log('✅ String response:', data);
      } else {
        console.log('⚠️ Unexpected response format:', data);
      }
    } else {
      console.error('❌ Error response:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Network/connection error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('🔍 This usually means:');
      console.error('   - CORS issue (n8n not allowing cross-origin requests)');
      console.error('   - Network connectivity issue');
      console.error('   - n8n server is down');
      console.error('   - Wrong webhook URL');
    }
  }
};

// Test CORS preflight
const testCORS = async () => {
  console.log('🔍 Testing CORS preflight...');
  
  try {
    const response = await fetch('http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f', {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS preflight response:', response.status);
    console.log('CORS headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('CORS test failed:', error);
  }
};

// Run tests
console.log('🚀 n8n Connectivity Test Suite');
console.log('================================');
console.log('');
console.log('Available test functions:');
console.log('- testN8nWebhook() - Test the main webhook connection');
console.log('- testCORS() - Test CORS preflight');
console.log('');
console.log('Run testN8nWebhook() to start testing...');
