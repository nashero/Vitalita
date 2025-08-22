# Appointment Calendar Interface

## Overview

The Appointment Calendar Interface is a comprehensive yearly calendar system for booking blood and plasma donation appointments at AVIS donation centers. It provides an intuitive visual interface for donors to select dates, donation types, centers, and time slots.

## Features

### 🗓️ Calendar Interface
- **Yearly View**: Overview of all months with quick navigation
- **Monthly View**: Detailed daily view with slot availability
- **Visual Indicators**: Clear status indicators for each day
- **Navigation**: Easy month/year navigation with "Today" button

### 🏥 Center Management
- **7 AVIS Centers**: Casalmaggiore, Gussola, Viadana, Piadena, Rivarolo del Re, Scandolara-Ravara, Calvatone
- **Operating Hours**: Monday-Saturday, 7:00 AM - 3:00 PM
- **Center Details**: Address, contact information, and status

### 🩸 Donation Types
- **Blood Donation**: 60 minutes, 450ml collection
- **Plasma Donation**: 60 minutes, 600-700ml collection
- **Slot Management**: Hourly slots with capacity tracking

### 🎯 Visual Indicators
- **Center Status**: Open/Closed indicators for each day
- **Slot Availability**: Color-coded availability (Green: Available, Orange: Limited, Red: Full)
- **Weekend Markers**: Clear weekend day identification
- **Today Highlight**: Current date highlighting

## Technical Implementation

### Frontend Components
- `AppointmentCalendar.tsx`: Main calendar interface component
- `AppointmentErrorDisplay.tsx`: Error handling and display
- Integration with existing `useAuth` hook for donor authentication

### Backend Integration
- **Supabase Database**: Real-time slot availability and booking
- **Availability Slots**: Hourly slots with capacity management
- **Appointments**: Booking records with audit logging
- **Donation Centers**: Center information and status

### Database Schema
```sql
-- Core tables
donation_centers (center_id, name, address, city, country, contact_phone, email, is_active)
availability_slots (slot_id, center_id, slot_datetime, donation_type, capacity, current_bookings, is_available)
appointments (appointment_id, donor_hash_id, donation_center_id, appointment_datetime, donation_type, status)

-- Views
available_slots_view: Real-time slot availability
center_operating_hours: Center operating information

-- Functions
generate_availability_slots(): Generate slots for date range
get_slot_statistics(): Get utilization statistics
cleanup_old_slots(): Remove expired slots
```

## Setup Instructions

### 1. Database Setup
Run the database setup script to create centers and slots:

**Windows:**
```bash
run-avis-setup.bat
```

**Unix/Linux:**
```bash
chmod +x run-avis-setup.sh
./run-avis-setup.sh
```

**Manual SQL:**
```bash
psql -h your-host -U your-user -d your-database -f setup-avis-centers-and-slots.sql
```

### 2. Component Integration
Add the calendar component to your main application:

```tsx
import AppointmentCalendar from './components/AppointmentCalendar';

// In your routing or main component
<AppointmentCalendar onBack={() => navigate('/dashboard')} />
```

### 3. Environment Configuration
Ensure your Supabase configuration is properly set up in `src/lib/supabase.ts`.

## Usage Flow

### 1. Calendar Navigation
- **Month/Year Toggle**: Switch between monthly and yearly views
- **Date Selection**: Click on any available date to open booking modal
- **Navigation**: Use arrow buttons to move between months/years

### 2. Appointment Booking
1. **Select Date**: Click on an available date in the calendar
2. **Choose Type**: Select Blood or Plasma donation
3. **Pick Center**: Choose from available AVIS centers
4. **Select Time**: Choose from available time slots
5. **Confirm**: Review and confirm your appointment

### 3. Visual Feedback
- **Green**: Plenty of slots available
- **Orange**: Limited availability
- **Red**: No slots available
- **Gray**: Center closed (weekends, holidays)

## Business Rules

### Operating Hours
- **Days**: Monday through Saturday
- **Hours**: 7:00 AM to 3:00 PM
- **Slots**: Hourly slots (7 AM, 8 AM, 9 AM, 10 AM, 11 AM, 12 PM, 1 PM, 2 PM)

### Donation Specifications
- **Blood**: 60 minutes duration, 450ml collection
- **Plasma**: 60 minutes duration, 600-700ml collection
- **Capacity**: 8 blood donors, 6 plasma donors per slot

### Booking Constraints
- **Advance Booking**: Up to 6 months in advance
- **Same Day**: Minimum 1 hour advance notice
- **Cancellation**: Up to 24 hours before appointment

## API Endpoints

### Slot Queries
```typescript
// Fetch available slots for a date
const { data: slots } = await supabase
  .from('availability_slots')
  .select(`
    *,
    donation_centers!inner (*)
  `)
  .gte('slot_datetime', startOfDay)
  .lte('slot_datetime', endOfDay)
  .eq('is_available', true);

// Get slot statistics
const { data: stats } = await supabase
  .rpc('get_slot_statistics', {
    p_start_date: startDate,
    p_end_date: endDate
  });
```

### Appointment Management
```typescript
// Create appointment
const { data: appointment } = await supabase
  .from('appointments')
  .insert({
    donor_hash_id: donorId,
    donation_center_id: centerId,
    appointment_datetime: slotDateTime,
    donation_type: donationType,
    status: 'SCHEDULED'
  });

// Update slot availability
const { error } = await supabase
  .from('availability_slots')
  .update({ current_bookings: currentBookings + 1 })
  .eq('slot_id', slotId);
```

## Maintenance

### Regular Tasks
- **Slot Generation**: Run `generate_next_6_months_slots()` monthly
- **Cleanup**: Run `cleanup_old_slots()` quarterly
- **Statistics**: Monitor utilization with `get_slot_statistics()`

### Monitoring
- **Slot Utilization**: Track booking rates and capacity
- **Center Performance**: Monitor center-specific metrics
- **Error Handling**: Review failed bookings and system errors

## Troubleshooting

### Common Issues
1. **No Slots Available**: Check if slots have been generated for the date range
2. **Center Not Showing**: Verify center is active in the database
3. **Booking Errors**: Check donor authentication and slot availability

### Debug Commands
```sql
-- Check center status
SELECT * FROM donation_centers WHERE is_active = true;

-- Verify slot generation
SELECT COUNT(*) FROM availability_slots WHERE slot_datetime >= CURRENT_DATE;

-- Check appointment conflicts
SELECT * FROM appointments WHERE appointment_datetime = '2024-01-15 10:00:00';
```

## Future Enhancements

### Planned Features
- **Recurring Appointments**: Regular donation scheduling
- **Waitlist Management**: Automatic slot filling for cancellations
- **SMS/Email Notifications**: Appointment reminders and confirmations
- **Mobile App**: Native mobile application
- **Analytics Dashboard**: Advanced reporting and insights

### Integration Opportunities
- **Payment Processing**: Donation incentives and fees
- **Health Records**: Integration with medical systems
- **Social Features**: Community engagement and gamification

## Support

For technical support or questions about the appointment calendar system:

- **Documentation**: Check this README and inline code comments
- **Database Issues**: Review Supabase logs and error messages
- **UI Problems**: Check browser console for JavaScript errors
- **Feature Requests**: Submit through your project management system

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: React 18+, TypeScript 4.5+, Supabase 2.x
