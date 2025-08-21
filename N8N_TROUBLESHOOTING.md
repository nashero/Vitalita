# n8n Integration Troubleshooting Guide

## 🚨 Current Issue
The VoiceAgent and ChatWidget are not connecting to the n8n webhook and are not working as expected.

## 🔍 Diagnostic Steps

### 1. **Check Environment Variables**
First, ensure you have a `.env` file in your project root with:

```bash
VITE_N8N_WEBHOOK_URL=http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f
VITE_VAPI_ASSISTANT_ID=7eed8831-dab4-4afa-b413-0818aecc0c57
VAPI_API_KEY=b0bed86f-579d-4210-9982-449afa3b0a70
```

**Important**: After adding/modifying the `.env` file, **restart your development server**.

### 2. **Use the n8n Test Panel**
I've added a yellow test tube button (🧪) to your landing page. Click it to open the n8n Test Panel and run these tests:

- **Test Basic**: Tests basic connectivity to the webhook
- **Test CORS**: Tests CORS preflight requests
- **Test VoiceAgent**: Tests VoiceAgent-specific message format
- **Test ChatWidget**: Tests ChatWidget-specific message format

### 3. **Check Browser Console**
Open browser console (F12) and look for:
- Configuration logs showing the webhook URL
- Network request logs
- Error messages with specific details

### 4. **Check Network Tab**
In browser DevTools → Network tab:
- Look for failed requests to the n8n webhook
- Check response status codes
- Look for CORS errors

## 🐛 Common Issues & Solutions

### **Issue 1: CORS Error**
```
Access to fetch at 'http://n8n.nashero.aero/webhook/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: The n8n server needs to allow cross-origin requests from your domain.

**n8n Server Configuration**:
1. In your n8n instance, go to Settings → API
2. Add your frontend domain to CORS allowed origins
3. Or temporarily disable CORS for testing

### **Issue 2: Network Error**
```
Failed to fetch
```

**Possible Causes**:
- n8n server is down
- Wrong webhook URL
- Network connectivity issues
- Firewall blocking the request

**Solutions**:
1. Verify n8n server is running
2. Check webhook URL is correct
3. Test from a different network
4. Check if the domain `n8n.nashero.aero` is accessible

### **Issue 3: 401/403 Authentication Error**
```
401 Unauthorized or 403 Forbidden
```

**Solutions**:
1. Verify webhook URL is correct
2. Check if n8n requires authentication
3. Verify webhook is active and not expired

### **Issue 4: 404 Not Found**
```
404 Not Found
```

**Solutions**:
1. Verify webhook URL is correct
2. Check if the webhook endpoint exists
3. Verify the webhook is active in n8n

## 🧪 Testing Commands

### **Browser Console Test**
Copy and paste this into your browser console:

```javascript
// Test basic connectivity
fetch('http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test', test: true })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

### **CORS Test**
```javascript
// Test CORS preflight
fetch('http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f', {
  method: 'OPTIONS',
  headers: {
    'Origin': window.location.origin,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(r => console.log('CORS Status:', r.status))
.catch(e => console.error('CORS Error:', e));
```

## 🔧 n8n Server Setup

### **Required n8n Configuration**
Your n8n server must:

1. **Allow CORS**: Configure CORS to allow your frontend domain
2. **Accept POST requests**: Webhook should accept POST with JSON
3. **Return proper responses**: Should return JSON with `output` field
4. **Be accessible**: Server should be reachable from your frontend

### **Example n8n Workflow**
```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "position": [0, 0],
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f"
      }
    },
    {
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [400, 0],
      "parameters": {
        "responseBody": "={{ { \"output\": \"Hello from n8n! I received: \" + $json.message } }}"
      }
    }
  ]
}
```

## 📋 Debug Checklist

- [ ] `.env` file exists with correct variables
- [ ] Development server restarted after `.env` changes
- [ ] n8n Test Panel shows test results
- [ ] Browser console shows configuration logs
- [ ] Network tab shows webhook requests
- [ ] n8n server is running and accessible
- [ ] Webhook URL is correct and active
- [ ] CORS is properly configured
- [ ] n8n workflow returns proper JSON response

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Run the n8n Test Panel** and share the results
2. **Check browser console** and share any error messages
3. **Verify n8n server status** - is it running and accessible?
4. **Test webhook manually** using curl or Postman
5. **Check n8n logs** for any server-side errors

## 📞 Quick Test Commands

### **Using curl (if you have it)**
```bash
curl -X POST http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f \
  -H "Content-Type: application/json" \
  -d '{"message":"test","test":true}'
```

### **Using PowerShell (Windows)**
```powershell
Invoke-RestMethod -Uri "http://n8n.nashero.aero/webhook/71d0f3a7-040d-465e-b365-c0c8f3cd586f" -Method POST -ContentType "application/json" -Body '{"message":"test","test":true}'
```

The n8n Test Panel will help identify exactly where the connection is failing. Use it to run tests and check the results!
