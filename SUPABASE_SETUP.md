# Supabase Connection Setup Guide

## Current Issue
Your Supabase connection is failing. Here's how to fix it:

## Step 1: Create Environment File
Create a `.env` file in your project root with the following content:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 2: Get Your Supabase Credentials
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
5. Replace the placeholder values in your `.env` file

## Step 3: Verify Database Tables
Make sure your database has the required tables. Based on your migrations, you should have:
- `donation_centers`
- `donors`
- `appointments`
- `staff`
- `availability_slots`
- `roles`
- `permissions`
- `role_permissions`
- `audit_logs`

## Step 4: Test Connection
The application will automatically test the connection when it loads. Check the browser console for detailed error messages.

## Common Issues and Solutions

### 1. "Missing Supabase credentials"
- **Cause**: Environment variables not set
- **Solution**: Create `.env` file with correct credentials

### 2. "relation 'donation_centers' does not exist"
- **Cause**: Database tables not created
- **Solution**: Run your Supabase migrations

### 3. "JWT token is invalid"
- **Cause**: Wrong API key or expired credentials
- **Solution**: Get fresh credentials from Supabase dashboard

### 4. CORS errors
- **Cause**: Domain not allowed in Supabase settings
- **Solution**: Add your domain to Supabase Auth settings

## Debugging Steps
1. Check browser console for specific error messages
2. Verify environment variables are loaded (check console logs)
3. Test connection manually in browser console:
   ```javascript
   import { supabase } from './src/lib/supabase';
   const { data, error } = await supabase.from('donation_centers').select('*').limit(1);
   console.log({ data, error });
   ```

## Current Configuration
Your current hardcoded values in `src/lib/supabase.ts`:
- URL: `https://pxvimagfvontwxygmtgpi.supabase.co`
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

These may be outdated or from a different project. 