# n8n Webhook Setup for Chat Widget

## Overview
The chat widget is already configured to send messages to your n8n webhook. When a user types a message, it triggers the webhook with the following data structure.

## Webhook URL
```
http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f
```

## Request Format
The chat widget sends POST requests with this JSON structure:

```json
{
  "message": "User's question here",
  "timestamp": "2025-07-28T14:30:00.000Z",
  "sessionId": "vitalita-chat-1722187800000",
  "userAgent": "Mozilla/5.0...",
  "source": "vitalita-chat-widget"
}
```

## Expected Response Format
Your n8n workflow should return JSON in one of these formats:

### Option 1: Standard Response
```json
{
  "response": "Your bot response message here"
}
```

### Option 2: Message Field
```json
{
  "message": "Your bot response message here"
}
```

### Option 3: Text Field
```json
{
  "text": "Your bot response message here"
}
```

### Option 4: Direct String
```json
"Your bot response message here"
```

## n8n Workflow Setup

### 1. Create New Workflow
1. Go to your n8n instance
2. Click "Add Workflow"
3. Name it "Vitalita Chat Bot"

### 2. Add Webhook Trigger
1. Add a "Webhook" node
2. Configure it as follows:
   - **HTTP Method**: POST
   - **Path**: `/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f`
   - **Response Mode**: Respond to Webhook

### 3. Process the Message
Add nodes to process the incoming message:

#### Option A: Simple Response
```javascript
// Add a "Set" node
{
  "response": "Thank you for your message! I'm here to help with blood donation questions."
}
```

#### Option B: AI Integration
```javascript
// Add an AI node (OpenAI, Claude, etc.)
// Configure it to process the message and generate responses
```

#### Option C: Database Lookup
```javascript
// Add a database node to look up answers
// Query your knowledge base for relevant responses
```

### 4. Return Response
Add a "Respond to Webhook" node with:
```json
{
  "response": "{{ $json.response }}"
}
```

## Testing the Connection

### 1. Browser Console
Open browser console and look for:
- "Sending message to n8n webhook"
- "Request body"
- "Response status"
- "n8n Response"

### 2. Test Button
In development mode, click the "Test Connection" button in the debug panel.

### 3. Manual Test
Send a message in the chat widget and check:
- Browser console for request/response logs
- n8n workflow execution logs

## Troubleshooting

### Common Issues:

#### 1. CORS Errors
- Ensure your n8n instance allows requests from your domain
- Add CORS headers in n8n if needed

#### 2. 404 Not Found
- Verify the webhook URL is correct
- Check that the webhook is active in n8n

#### 3. 500 Server Error
- Check n8n workflow execution logs
- Verify the workflow is properly configured

#### 4. No Response
- Ensure your workflow returns the correct JSON format
- Check that the "Respond to Webhook" node is connected

### Debug Steps:
1. **Check Environment Variable**: Verify `VITE_N8N_WEBHOOK_URL` is set correctly
2. **Test Webhook URL**: Try accessing the webhook URL directly
3. **Check n8n Logs**: Look at workflow execution history
4. **Browser Console**: Check for network errors or response issues

## Example Workflow

```
Webhook Trigger → Process Message → AI/Logic → Format Response → Respond to Webhook
```

## Advanced Features

### Session Management
The `sessionId` field can be used to maintain conversation context across messages.

### User Agent Tracking
The `userAgent` field helps identify the user's browser and device.

### Timestamp Logging
The `timestamp` field helps track when messages were sent.

## Security Considerations

1. **Validate Input**: Sanitize user messages before processing
2. **Rate Limiting**: Implement rate limiting in your n8n workflow
3. **Authentication**: Consider adding API keys for production use
4. **Logging**: Log conversations for monitoring and improvement 