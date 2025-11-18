# Donor Management Interface - Privacy-First Implementation

Complete donor management system for the Vitalita staff portal with GDPR-compliant, privacy-first architecture.

## Overview

This implementation provides comprehensive donor management functionality while maintaining strict privacy standards:
- **Hash-based identification only** - Never stores or displays actual donor IDs
- **Minimal PII** - Only shows data necessary for operations
- **Access logging** - All donor record access is audited
- **Permission-based access** - Role-based data visibility
- **GDPR compliant** - Privacy-first design throughout

## Backend Implementation

### API Endpoints Created

1. **GET /api/staff/donors** - List donors (paginated, filtered)
2. **GET /api/staff/donors/:hash** - Get donor by hash (NOT by actual ID)
3. **GET /api/staff/donors/:hash/history** - Donation history
4. **GET /api/staff/donors/:hash/eligibility** - Check current eligibility
5. **PUT /api/staff/donors/:hash/notes** - Add staff notes
6. **GET /api/staff/donors/stats** - Donor statistics (aggregated)
7. **POST /api/staff/donors/search** - Search donors by criteria

### Files Created

**Backend:**
- `staff-portal-api/src/controllers/donors.controller.ts` - Main controller
- `staff-portal-api/src/routes/donors.routes.ts` - Route definitions

**Frontend:**
- `staff-portal/src/components/donors/DonorList.tsx` - List view with filters
- `staff-portal/src/components/donors/DonorProfile.tsx` - Profile view
- `staff-portal/src/components/donors/DonorHistory.tsx` - History timeline
- `staff-portal/src/components/donors/EligibilityChecker.tsx` - Eligibility calculator
- `staff-portal/src/hooks/useDonors.ts` - React Query hooks

## Privacy Features

### Hash-Based Identification
- **Never uses actual donor IDs** - All lookups use SHA-256 hashes
- **Hash display** - Shows truncated hash (first 8 + last 4 chars) by default
- **Full hash access** - Can be revealed with permission for verification
- **No PII in database queries** - Staff portal never stores actual IDs

### Data Minimization
- **Minimal PII display** - Only shows:
  - Donor hash (for identification)
  - Donation statistics
  - Eligibility status
  - Center association
  - Preferred language/channel (anonymized)
- **No personal details** - No names, addresses, phone numbers, emails
- **Masked data** - Sensitive fields are truncated or masked

### Access Control
- **Permission-based rendering:**
  - `donors:view` - View donor list and profiles
  - `donors:view_notes` - View staff notes
  - `donors:add_notes` - Add staff notes
- **Role-based access:**
  - Medical staff: Full access including medical notes
  - Administrative: Basic info, appointment history
  - Executive: Statistics and aggregated data only
  - Others: Limited or no access

### Audit Logging
- **All access logged** - Every donor record access is logged
- **Search logging** - All searches are audited
- **Note access** - Viewing/adding notes is logged
- **Eligibility checks** - All eligibility queries logged
- **GDPR compliance** - Full audit trail for data protection

## Features

### Donor List
- Table view with hash IDs (truncated)
- Search by hash prefix (minimum 4 characters)
- Filter by: center, eligibility status, donation type, date range
- Sort by: last donation, total donations, hash
- Pagination
- Click to view details

### Donor Profile
- Anonymized donor information
- Hash display (with show/hide toggle)
- Donation statistics
- Center information
- Eligibility status
- Staff notes (permission-based)
- Privacy notices

### Donation History
- Timeline of all donations
- Donation type, date, center
- Volume and status
- Staff who processed
- Notes/adverse reactions
- Chart showing donation frequency

### Eligibility Checker
- Real-time eligibility calculation
- Italian regulation compliance
- Next eligible date with countdown
- Reasons for ineligibility
- Rules display (min days, max per year)
- Supports both whole blood and plasma

### Statistics
- Aggregated data only (no individual records)
- Total active donors per center
- Donation frequency trends
- Retention rates
- Demographics (aggregated)
- No-show rates

## Italian Donation Rules

### Whole Blood
- **Minimum interval:** 90 days between donations
- **Maximum per year:** 4 donations
- **Volume:** ~450ml per donation

### Plasma
- **Minimum interval:** 14 days between donations
- **Maximum per year:** 12 liters
- **Volume:** ~650ml per donation

### Validation
- Checks days since last donation
- Checks total donations this year
- Validates donor account is active
- Real-time eligibility calculation

## Integration

### With Existing Donor Portal
- Uses same hash generation algorithm
- Compatible with voice/chatbot bookings
- Same validation rules
- Shared appointments table

### With Staff Portal
- Integrates with RBAC system
- Uses existing audit logging
- Respects center-based access
- Permission-based features

## Security & Privacy

### Data Protection
- **No PII storage** - Staff portal never stores actual donor IDs
- **Hash-only queries** - All database queries use hashes
- **Encrypted connections** - HTTPS required
- **Access logging** - All access tracked

### GDPR Compliance
- **Right to be forgotten** - Hash-based system supports anonymization
- **Data minimization** - Only necessary data displayed
- **Access control** - Role-based permissions
- **Audit trail** - Complete access logging
- **Privacy notices** - Clear notices in UI

### Staff Notes
- **Permission-based** - Only authorized staff can view/add
- **Note types** - General, medical, administrative
- **Audit logging** - All note access logged
- **Privacy** - Notes don't contain PII

## Usage Examples

### Search Donor
```typescript
// Staff must obtain hash from donor
const hash = 'abc123...'; // First 4+ characters
const { data } = useDonor(hash);
```

### Check Eligibility
```typescript
const { data } = useDonorEligibility(hash, 'whole_blood');
// Returns: status, eligible, next_eligible_date, reasons, rules
```

### Add Note
```typescript
const addNote = useAddDonorNote();
await addNote.mutateAsync({
  hash,
  note_text: 'Donor prefers morning appointments',
  note_type: 'general',
});
```

## Permissions Required

- `donors:view` - View donor list and profiles
- `donors:view_notes` - View staff notes
- `donors:add_notes` - Add staff notes

## Database Schema

### Donor Notes Table
Created automatically if it doesn't exist:
```sql
CREATE TABLE staff_portal.donor_notes (
  note_id UUID PRIMARY KEY,
  donor_hash_id VARCHAR NOT NULL,
  note_text TEXT NOT NULL,
  note_type VARCHAR DEFAULT 'general',
  created_by UUID REFERENCES staff_portal.users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

- **404** - Donor not found (hash doesn't exist)
- **403** - Insufficient permissions
- **400** - Validation errors
- **500** - Server errors

All errors logged to audit system.

## Next Steps

1. **Donor Search Enhancement** - Add more search criteria
2. **Bulk Operations** - Bulk eligibility checks
3. **Export Functionality** - Export donor lists (anonymized)
4. **Advanced Analytics** - More detailed statistics
5. **Notification System** - Notify when donors become eligible
6. **Integration Testing** - Test with real hash data

## Testing

To test the implementation:

1. **Start Backend:**
   ```bash
   cd staff-portal-api
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd staff-portal
   npm run dev
   ```

3. **Test Flow:**
   - Login to staff portal
   - Navigate to donors
   - Search by hash (obtain from donor)
   - View profile
   - Check eligibility
   - View history
   - Add note (if permission)

## Privacy Best Practices

1. **Never store actual IDs** - Always use hashes
2. **Minimize data display** - Only show necessary information
3. **Log all access** - Complete audit trail
4. **Permission checks** - Verify before showing sensitive data
5. **Mask sensitive data** - Truncate or mask when possible
6. **Clear notices** - Inform users about privacy practices

## Compliance

This implementation is designed to be:
- **GDPR compliant** - Privacy-first architecture
- **HIPAA ready** - Medical data protection
- **Audit ready** - Complete access logging
- **Secure** - Hash-based identification only

## Documentation

- **API Documentation:** See controller files for endpoint details
- **Component Usage:** See component files for props and usage
- **Hooks Documentation:** See `useDonors.ts` for hook details

