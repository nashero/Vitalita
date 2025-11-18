// Chat Widget Configuration
export const CHAT_CONFIG = {
  // n8n Webhook URL - Replace with your actual n8n instance URL
  n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.nashero.aero/webhook-test/2abffb6c-6b78-4631-b2ba-0a7ff61b653f',
  
  // Debug logging for environment variables
  debug: {
    envUrl: import.meta.env.VITE_N8N_WEBHOOK_URL ? 'Set' : 'Missing',
    finalUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'Using fallback URL',
    actualUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.nashero.aero/webhook-test/2abffb6c-6b78-4631-b2ba-0a7ff61b653f'
  },
  
  // Chat Widget Settings
  title: 'Vitalita Assistant',
  welcomeMessage: 'Hello! I\'m here to help you with your blood donation questions. How can I assist you today?',
  
  // Fallback responses when n8n is not available
  fallbackResponses: [
    'I\'m here to help! You can ask me about:\n• Booking appointments\n• Donation requirements\n• Center locations\n• General questions',
    'I can help you with:\n• Scheduling blood donations\n• Finding nearby centers\n• Understanding eligibility\n• Answering FAQs',
    'Need assistance? I can help with:\n• Appointment booking\n• Donation guidelines\n• Center information\n• Health requirements'
  ],
  
  // Chat widget appearance
  position: {
    bottom: '1rem',
    right: '1rem'
  },
  
  // Chat window dimensions
  dimensions: {
    width: '20rem', // 320px
    height: '24rem' // 384px
  }
};

// Helper function to get a random fallback response
export const getRandomFallbackResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * CHAT_CONFIG.fallbackResponses.length);
  return CHAT_CONFIG.fallbackResponses[randomIndex];
};

