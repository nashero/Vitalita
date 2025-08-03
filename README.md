# Vitalita - Blood Donation Management System

A comprehensive blood donation management system built with React, TypeScript, and Supabase. The system provides secure, GDPR-compliant donor registration, appointment booking, and staff management capabilities.

## 🩸 Features

### For Donors
- **Secure Registration**: Hash-based authentication without storing personal identifiable information
- **GDPR Compliant**: No PII stored in the database
- **Appointment Booking**: Easy scheduling for blood and plasma donations
- **Dashboard**: View donation history and account status
- **Multi-language Support**: Configurable language preferences

### For Staff
- **Comprehensive Dashboard**: Real-time statistics and management tools
- **Appointment Management**: View and manage donor appointments
- **Availability Management**: Control donation center capacity and scheduling
- **Donor Management**: Review and approve donor registrations
- **Audit Logs**: Complete system activity tracking
- **Role-based Access**: Different permission levels for staff members

## 🏗️ Architecture

### Database Schema
- **donors**: Hash-based donor authentication and preferences
- **appointments**: Donation appointments and scheduling
- **donation_centers**: AVIS center information
- **availability_slots**: Time slots for donations
- **staff**: Staff member accounts and roles
- **roles**: Role definitions and permissions
- **permissions**: System permissions
- **role_permissions**: Role-permission assignments
- **audit_logs**: System activity tracking

### Security Features
- **Hash-based Authentication**: No passwords stored in plain text
- **GDPR Compliance**: No personal identifiable information stored
- **Row Level Security**: Database-level access control
- **Audit Logging**: Complete activity tracking
- **Salt-based Hashing**: Additional security layer

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vitalita
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://supabase.com/dashboard/org/amfvzmbmlcmhhzzkotgi
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/` in order
   - The migrations will create all necessary tables, indexes, and security policies

5. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Running Migrations
The database migrations are located in `supabase/migrations/` and should be run in chronological order:

1. `20250630130535_white_island.sql` - Initial donors table
2. `20250630131139_smooth_sound.sql` - Updated donors schema
3. `20250630131906_young_shape.sql` - Appointments table
4. `20250630132106_still_cloud.sql` - Staff table
5. `20250630132242_empty_ocean.sql` - Donation centers
6. `20250630132511_empty_cake.sql` - Availability slots
7. `20250630132636_red_forest.sql` - Roles and permissions
8. `20250630132829_jade_water.sql` - Role permissions
9. `20250630133028_winter_bird.sql` - Role permissions junction
10. `20250630133257_humble_queen.sql` - Audit logs
11. `20250630191021_tiny_truth.sql` - Additional features
12. `20250630195000_round_dream.sql` - Enhanced features
13. `20250630195232_restless_mode.sql` - Advanced features
14. `20250630195324_billowing_wood.sql` - GDPR compliance

### Seeding Data
Run the seed script to populate the database with sample data:
```bash
npm run seed
```

This will create:
- 7 donation centers
- 5 staff roles
- 14 permissions
- 2 staff members (admin and staff)
- 7 sample donors
- Availability slots for the next 7 days
- Sample appointments

## 🔑 Test Credentials

### Staff Login
- **Admin**: username=`admin`, password=`admin123`
- **Staff**: username=`staff1`, password=`staff123`

### Sample Donor Logins
- **Mario Rossi**: FirstName=`Mario`, LastName=`Rossi`, DateOfBirth=`1985-03-15`, Center=`Casalmaggiore`
- **Giulia Bianchi**: FirstName=`Giulia`, LastName=`Bianchi`, DateOfBirth=`1990-07-22`, Center=`Gussola`
- **Luca Verdi**: FirstName=`Luca`, LastName=`Verdi`, DateOfBirth=`1988-11-08`, Center=`Viadana`
- **Sofia Neri**: FirstName=`Sofia`, LastName=`Neri`, DateOfBirth=`1992-05-14`, Center=`Piadena`
- **Marco Bianchi**: FirstName=`Marco`, LastName=`Bianchi`, DateOfBirth=`1987-09-03`, Center=`Rivarolo del Re`
- **Elena Rossi**: FirstName=`Elena`, LastName=`Rossi`, DateOfBirth=`1991-12-21`, Center=`Scandolara-Ravara`
- **Antonio Ferrari**: FirstName=`Antonio`, LastName=`Ferrari`, DateOfBirth=`1986-08-17`, Center=`Calvatone`

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── LandingPage.tsx
│   ├── DonorRegistration.tsx
│   ├── AppointmentBooking.tsx
│   ├── Dashboard.tsx
│   ├── StaffDashboard.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useStaffAuth.ts
├── lib/                # Library configurations
│   └── supabase.ts
├── utils/              # Utility functions
│   └── crypto.ts
└── ...
```

### Key Components

#### Authentication
- **useAuth**: Donor authentication with hash-based system
- **useStaffAuth**: Staff authentication with username/password

#### Database Integration
- **supabase.ts**: Supabase client configuration with TypeScript types
- **crypto.ts**: SHA-256 hashing utilities

#### Main Features
- **DonorRegistration**: GDPR-compliant donor registration
- **AppointmentBooking**: Multi-step appointment scheduling
- **Dashboard**: Donor dashboard with appointment history
- **StaffDashboard**: Staff management interface

## 🔒 Security Features

### GDPR Compliance
- No personal identifiable information stored in database
- Hash-based authentication only
- Complete audit trail for compliance
- Data minimization principles

### Authentication
- **Donors**: Hash-based authentication using personal details
- **Staff**: Username/password with salt-based hashing
- **Session Management**: Local storage with automatic cleanup

### Database Security
- Row Level Security (RLS) policies
- Role-based access control
- Comprehensive audit logging
- Input validation and sanitization

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 🚀 Deployment

### Environment Variables
Ensure the following environment variables are set:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Build and Deploy
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Vitalita** - Saving lives through secure, efficient blood donation management.