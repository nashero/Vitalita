# Environment Setup for n8n Integration

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# n8n Webhook Configuration
VITE_N8N_WEBHOOK_URL=http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f

# VAPI Voice Assistant Configuration
VITE_VAPI_ASSISTANT_ID=7eed8831-dab4-4afa-b413-0818aecc0c57
VAPI_API_KEY=b0bed86f-579d-4210-9982-449afa3b0a70
```

## Testing n8n Connectivity

1. **Browser Console Test**: Open browser console and run the test script from `test-n8n-connectivity.js`
2. **Check Network Tab**: Look for failed requests to the n8n webhook
3. **CORS Issues**: If you see CORS errors, the n8n server needs to allow your domain

## Common Issues and Solutions

### 1. CORS Error
- **Problem**: `Access to fetch at 'http://n8n.nashero.aero/webhook/...' from origin 'http://localhost:3000' has been blocked by CORS policy`
- **Solution**: Configure n8n to allow cross-origin requests from your domain

### 2. Network Error
- **Problem**: `Failed to fetch` or connection timeout
- **Solution**: 
  - Check if n8n server is running
  - Verify webhook URL is correct
  - Check network connectivity

### 3. Authentication Error
- **Problem**: 401 Unauthorized or 403 Forbidden
- **Solution**: Verify webhook URL and any required authentication

## n8n Server Configuration

Ensure your n8n server allows:
- POST requests to the webhook endpoint
- Cross-origin requests from your frontend domain
- JSON content-type in requests

## Testing Steps

1. **Environment Setup**: Create `.env` file with correct variables
2. **Restart Dev Server**: Restart your development server after adding environment variables
3. **Browser Test**: Run the connectivity test in browser console
4. **Check Logs**: Look for console logs showing n8n requests/responses
5. **Verify Integration**: Test both VoiceAgent and ChatWidget components 