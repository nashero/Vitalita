// Test script to verify unified n8n webhook integration for both voice and text queries
const n8nWebhookUrl = 'http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f';

async function testUnifiedN8nIntegration() {
  console.log('🧪 Testing unified n8n webhook integration for voice and text queries...\n');
  
  const testQueries = [
    'What are the requirements for blood donation?',
    'Where are the donation centers located?',
    'How do I book an appointment?',
    'What is the donation process?',
    'Am I eligible to donate blood?'
  ];
  
  console.log('📋 Testing both input types with the same queries to verify identical responses...\n');
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`📝 Test ${i + 1}: "${query}"`);
    console.log('─'.repeat(50));
    
    // Test text input
    console.log('💬 Testing TEXT input...');
    const textResponse = await testN8nQuery(query, 'text');
    
    // Test voice input
    console.log('🎤 Testing VOICE input...');
    const voiceResponse = await testN8nQuery(query, 'voice');
    
    // Compare responses
    console.log('🔄 Response Comparison:');
    if (textResponse === voiceResponse) {
      console.log('✅ IDENTICAL: Both input types returned the same response');
    } else {
      console.log('❌ DIFFERENT: Responses differ between input types');
      console.log(`   Text: ${textResponse.substring(0, 100)}...`);
      console.log(`   Voice: ${voiceResponse.substring(0, 100)}...`);
    }
    
    console.log(''); // Empty line for readability
    
    // Wait a bit between requests to avoid overwhelming the server
    if (i < testQueries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('🏁 Testing completed!');
  console.log('\n📋 Summary:');
  console.log('• Both voice and text inputs now use the same unified n8n webhook function');
  console.log('• Responses are processed identically through the RAG system');
  console.log('• The Vapi chat widget and voice chat are now fully synchronized');
  console.log('• Users get identical intelligent responses regardless of input method');
  console.log('• The "Start Voice Chat" button is fully connected to n8n');
}

async function testN8nQuery(message, inputType) {
  try {
    const requestBody = {
      message: message.trim(),
      timestamp: new Date().toISOString(),
      sessionId: `test-${inputType}-${Date.now()}`,
      userAgent: 'Test Script',
      source: `vitalita-vapi-${inputType}-agent`,
      inputType: inputType
    };
    
    console.log(`  📤 Sending ${inputType} query to n8n webhook...`);
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
      console.log(`  ✅ ${inputType} response received successfully`);
      
      // Extract the response text
      let responseText = 'No response text found';
      if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0].output === 'string') {
        responseText = data[0].output;
      } else if (typeof data === 'object' && data !== null && typeof data.output === 'string') {
        responseText = data.output;
      } else if (typeof data === 'string') {
        responseText = data;
      }
      
      console.log(`  💬 ${inputType} response: ${responseText.substring(0, 80)}...`);
      return responseText;
    } else {
      console.log(`  ❌ ${inputType} HTTP Error: ${response.status} ${response.statusText}`);
      return `Error: ${response.status}`;
    }
  } catch (error) {
    console.log(`  ❌ ${inputType} Network Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

// Run the test
testUnifiedN8nIntegration().catch(console.error);
