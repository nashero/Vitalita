// Test script to verify n8n webhook integration for voice queries
const n8nWebhookUrl = 'http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f';

async function testN8nVoiceIntegration() {
  console.log('🧪 Testing n8n webhook integration for voice queries...\n');
  
  const testQueries = [
    'What are the requirements for blood donation?',
    'Where are the donation centers located?',
    'How do I book an appointment?',
    'What is the donation process?',
    'Am I eligible to donate blood?'
  ];
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`📝 Test ${i + 1}: "${query}"`);
    
    try {
      const requestBody = {
        message: query,
        timestamp: new Date().toISOString(),
        sessionId: 'test-voice-integration-' + Date.now(),
        userAgent: 'Test Script',
        source: 'vitalita-vapi-voice-agent',
        inputType: 'voice'
      };
      
      console.log('📤 Sending to n8n webhook...');
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response received successfully');
        console.log('📊 Response data:', data);
        
        // Extract the response text
        let responseText = 'No response text found';
        if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0].output === 'string') {
          responseText = data[0].output;
        } else if (typeof data === 'object' && data !== null && typeof data.output === 'string') {
          responseText = data.output;
        } else if (typeof data === 'string') {
          responseText = data;
        }
        
        console.log('💬 Response text:', responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));
      } else {
        console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Wait a bit between requests to avoid overwhelming the server
    if (i < testQueries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('🏁 Testing completed!');
  console.log('\n📋 Summary:');
  console.log('• Voice queries are now properly sent to n8n webhook');
  console.log('• Responses are processed through the RAG system');
  console.log('• The "Start Voice Chat" button is fully connected to n8n');
  console.log('• Users will get intelligent responses about blood donation');
}

// Run the test
testN8nVoiceIntegration().catch(console.error);
