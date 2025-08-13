// Debug script to test webhook connection
// Run with: node debug-webhook.js

const testWebhookUrl = process.env.VITE_N8N_WEBHOOK_URL || 'http://n8n.nashero.aero/webhook-test/2abffb6c-6b78-4631-b2ba-0a7ff61b653f';

console.log('🔍 Testing webhook connection...');
console.log('📡 Webhook URL:', testWebhookUrl);

async function testWebhook() {
  try {
    const testMessage = {
      message: 'Test message from debug script',
      timestamp: new Date().toISOString(),
      sessionId: 'debug-test-' + Date.now(),
      userAgent: 'Debug Script',
      source: 'vitalita-debug'
    };

    console.log('📤 Sending test message...');
    console.log('📋 Request body:', JSON.stringify(testMessage, null, 2));

    const response = await fetch(testWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
      
      // Check response format
      if (data && typeof data === 'object') {
        if (data.response) {
          console.log('✅ Found response field:', data.response);
        } else if (data.message) {
          console.log('✅ Found message field:', data.message);
        } else if (data.text) {
          console.log('✅ Found text field:', data.text);
        } else if (Array.isArray(data) && data.length > 0 && data[0].output) {
          console.log('✅ Found array with output field:', data[0].output);
        } else {
          console.log('⚠️  Response format may not be compatible with chat widget');
          console.log('Expected: { "response": "message" } or { "message": "message" }');
        }
      } else if (typeof data === 'string') {
        console.log('✅ Response is a string:', data);
      } else {
        console.log('⚠️  Unexpected response format:', typeof data);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, response.statusText);
      console.error('❌ Error body:', errorText);
      
      // Common error diagnosis
      if (response.status === 404) {
        console.log('💡 Solution: Check that the webhook URL is correct and the workflow is active');
      } else if (response.status === 403) {
        console.log('💡 Solution: Check CORS settings in your n8n instance');
      } else if (response.status === 500) {
        console.log('💡 Solution: Check your n8n workflow for errors');
      }
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solution: Check that n8n.nashero.aero is accessible and the service is running');
    } else if (error.message.includes('CORS')) {
      console.log('💡 Solution: Configure CORS headers in your n8n webhook response');
    } else {
      console.log('💡 Solution: Check your internet connection and firewall settings');
    }
  }
}

testWebhook();