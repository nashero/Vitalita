# Quick Start Guide

## Prerequisites

1. **PostgreSQL Database** with `staff_portal` schema created
2. **Node.js 18+** installed
3. **SMTP Email Service** configured (Gmail, SendGrid, etc.)

## Setup Steps

### 1. Install Dependencies

```bash
cd staff-portal-api
npm install
```

### 2. Configure Environment

Create a `.env` file in the `staff-portal-api` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (use your actual credentials)
DATABASE_URL=postgresql://postgres:password@localhost:5432/vitalita
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitalita
DB_USER=postgres
DB_PASSWORD=your_password

# JWT (generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@vitalita.it

# Frontend URL
FRONTEND_URL=http://localhost:5175

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

Ensure you've run the staff portal schema migrations:

```bash
# From project root
psql -h localhost -U postgres -d vitalita -f supabase/migrations/20250115000000_create_staff_portal_schema.sql
psql -h localhost -U postgres -d vitalita -f supabase/migrations/20250115000002_seed_staff_portal_data.sql
```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:3001/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3001/api/staff/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "first_name": "Test",
    "last_name": "User",
    "avis_center_id": "your-center-uuid",
    "organizational_level": "Municipal"
  }'
```

**Note:** You'll need a valid `avis_center_id` from your `staff_portal.avis_centers` table.

### 3. Login

```bash
curl -X POST http://localhost:3001/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }' \
  -c cookies.txt
```

This saves cookies to `cookies.txt` for subsequent requests.

### 4. Get Current User

```bash
curl -X GET http://localhost:3001/api/staff/me \
  -b cookies.txt
```

## Common Issues

### Database Connection Error

**Problem:** `Connection refused` or `password authentication failed`

**Solution:**
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists: `createdb vitalita`

### Email Not Sending

**Problem:** Email service errors

**Solution:**
1. For Gmail: Use App Password (not regular password)
2. Enable "Less secure app access" or use OAuth2
3. Check SMTP settings in `.env`
4. Verify firewall allows outbound SMTP connections

### JWT Secret Error

**Problem:** `JWT_SECRET is not defined`

**Solution:**
1. Ensure `.env` file exists
2. Set `JWT_SECRET` to a strong random string (min 32 characters)
3. Restart the server after changing `.env`

### CORS Errors

**Problem:** Frontend can't connect to API

**Solution:**
1. Check `FRONTEND_URL` in `.env` matches your frontend URL
2. Ensure credentials are included in frontend requests:
   ```javascript
   fetch('http://localhost:3001/api/staff/login', {
     method: 'POST',
     credentials: 'include', // Important!
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   })
   ```

## Next Steps

1. **Create AVIS Centers:** Insert centers into `staff_portal.avis_centers` table
2. **Approve Users:** Create an admin interface to approve pending registrations
3. **Assign Roles:** Assign appropriate roles to approved users
4. **Frontend Integration:** Connect your frontend to these API endpoints

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use secure database credentials
- [ ] Configure production SMTP service
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Review rate limiting settings
- [ ] Test all endpoints thoroughly

## Support

For issues or questions, refer to the main README.md or check the code comments.

