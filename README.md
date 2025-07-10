# Vitalita - Blood Donation Management System

A comprehensive blood donation management system built with React, TypeScript, and Supabase.

## Features

### 🩸 **Donor Portal**
- Secure SHA-256 authentication with hashed credentials
- Appointment booking with real-time availability
- Personal dashboard with donation history
- Multi-language support and communication preferences

### 👨‍💼 **Staff Portal**
- Role-based access control with permissions
- Comprehensive appointment management
- Availability slot management for donation centers
- Complete system audit trail and logging
- Real-time dashboard with analytics

### 🏥 **System Management**
- Multi-center support with location management
- Flexible availability scheduling
- Automated audit logging for compliance
- Advanced filtering and search capabilities
- Data export functionality

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom SHA-256 implementation
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vitalita
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Database Setup**
   - Run the migration files in `/supabase/migrations/` in your Supabase project
   - Ensure all tables, triggers, and RLS policies are created

5. **Seed Data (Optional)**
   If you have a `vitalita-viva-seed.json` file:
   ```bash
   # Import seed data (append to existing)
   npm run seed
   
   # Clear existing data and import fresh
   npm run seed:clear
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Core Tables
- **donors**: Donor information with hashed IDs
- **staff**: Staff members with role-based access
- **donation_centers**: Physical donation locations
- **appointments**: Scheduled donation appointments
- **availability_slots**: Available time slots for donations
- **roles & permissions**: Access control system
- **audit_logs**: Complete system activity trail

### Security Features
- Row Level Security (RLS) enabled on all tables
- Encrypted donor identification using SHA-256
- Comprehensive audit logging
- Role-based access control

## Usage

### Donor Access
1. Navigate to the application
2. Select "Donor Portal"
3. Enter your Donor ID and Secret Credential
4. Book appointments, view history, and manage preferences

### Staff Access
1. Navigate to the application
2. Select "Staff Portal" 
3. Enter your username and password
4. Access appointment management, availability scheduling, and system logs

## Seed Data Import

The application includes a robust seed data import script:

### Features
- **Ordered insertion** to handle foreign key dependencies
- **Error handling** with detailed feedback
- **Data validation** before insertion
- **Optional data clearing** for fresh imports
- **Progress tracking** with detailed logging

### Usage
```bash
# Basic import (appends to existing data)
npm run seed

# Clear existing data and import fresh
npm run seed:clear

# Direct script usage
node import-vitalita-seed.js
node import-vitalita-seed.js --clear
```

### Seed File Format
The script expects a `vitalita-viva-seed.json` file with the following structure:
```json
{
  "roles": [...],
  "permissions": [...],
  "role_permissions": [...],
  "donors": [...],
  "donation_centers": [...],
  "staff": [...],
  "availability_slots": [...],
  "appointments": [...],
  "audit_logs": [...]
}
```

### Import Order
The script automatically handles dependencies:
1. Roles & Permissions (no dependencies)
2. Role Permissions (depends on roles & permissions)
3. Donors & Donation Centers (no dependencies)
4. Staff (depends on roles)
5. Availability Slots (depends on donation centers)
6. Appointments (depends on donors, centers, staff, slots)
7. Audit Logs (optional, no dependencies)

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run seed` - Import seed data
- `npm run seed:clear` - Clear and import seed data

### Project Structure
```
src/
├── components/          # React components
│   ├── AuthProvider.tsx
│   ├── Dashboard.tsx
│   ├── LoginForm.tsx
│   ├── StaffDashboard.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

## Security Considerations

- All sensitive data is encrypted using SHA-256
- Row Level Security enforces data access policies
- Comprehensive audit logging tracks all system activities
- Role-based permissions control feature access
- Environment variables protect API keys and secrets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review the database schema
- Examine the audit logs for troubleshooting
- Contact the development team

---

**Vitalita** - Saving lives through efficient blood donation management.