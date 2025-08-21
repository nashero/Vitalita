#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 VAPI Environment Setup Script');
console.log('================================\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('This script will append VAPI variables to it.\n');
}

// Get user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupVapiEnv() {
  try {
    console.log('Please provide your VAPI credentials:');
    console.log('(Get these from https://console.vapi.ai/)\n');
    
    const assistantId = await askQuestion('Enter your VAPI Assistant ID: ');
    const apiKey = await askQuestion('Enter your VAPI API Key: ');
    
    if (!assistantId || !apiKey) {
      console.log('\n❌ Both Assistant ID and API Key are required!');
      rl.close();
      return;
    }
    
    // Prepare environment variables
    const vapiEnvVars = `# VAPI Configuration
# Get these values from https://console.vapi.ai/
VITE_VAPI_ASSISTANT_ID=${assistantId}
VITE_VAPI_API_KEY=${apiKey}

`;
    
    // Read existing .env content if it exists
    let existingContent = '';
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if VAPI variables already exist
      if (existingContent.includes('VITE_VAPI_ASSISTANT_ID') || existingContent.includes('VITE_VAPI_API_KEY')) {
        console.log('\n⚠️  VAPI variables already exist in .env file!');
        const overwrite = await askQuestion('Do you want to overwrite them? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
          console.log('❌ Setup cancelled.');
          rl.close();
          return;
        }
        
        // Remove existing VAPI variables
        existingContent = existingContent
          .split('\n')
          .filter(line => !line.startsWith('VITE_VAPI_'))
          .join('\n');
      }
    }
    
    // Combine existing content with new VAPI variables
    const newContent = existingContent + vapiEnvVars;
    
    // Write to .env file
    fs.writeFileSync(envPath, newContent);
    
    console.log('\n✅ VAPI environment variables added to .env file!');
    console.log('\n📁 File location:', envPath);
    console.log('\n🔑 Variables added:');
    console.log(`   VITE_VAPI_ASSISTANT_ID=${assistantId}`);
    console.log(`   VITE_VAPI_API_KEY=${apiKey.substring(0, 8)}...`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. The VoiceAgent component will automatically use these variables');
    console.log('3. Check the browser console for any remaining errors');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupVapiEnv();
