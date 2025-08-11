# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA

# n8n Webhook Configuration for Chat Widget
VITE_N8N_WEBHOOK_URL=https://n8n.nashero.aero/webhook/2abffb6c-6b78-4631-b2ba-0a7ff61b653f
```

## n8n Webhook Setup

### 1. Get Your n8n Webhook URL
1. Go to your n8n instance
2. Create a new workflow
3. Add a "Webhook" trigger node
4. Copy the webhook URL (it will look like: `https://your-n8n-instance.com/webhook/abc123`)
5. Add this URL to your `.env` file

### 2. Configure the Webhook Response
Your n8n workflow should return a JSON response in this format:
```json
{
  "response": "Your bot response message here"
}
```

### 3. Test the Connection
The chat widget will automatically test the connection when a user sends a message.

## Environment Variable Debugging

The chat widget will log the webhook URL being used. Check the browser console to see:
- Whether the environment variable is being read correctly
- The actual webhook URL being used
- Any connection errors

## Example n8n Workflow

1. **Webhook Trigger**: Receives POST requests from the chat widget
2. **Process Message**: Extract the message from the request body
3. **Generate Response**: Use AI, database lookup, or predefined responses
4. **Return Response**: Send back JSON with the response message

## Troubleshooting

- **Webhook not found**: Check that the URL is correct and the webhook is active
- **CORS errors**: Ensure your n8n instance allows requests from your domain
- **No response**: Check that your n8n workflow returns the correct JSON format 