# Donor ID Feature Implementation

## Overview

This document describes the implementation of the Donor ID feature that captures and stores unique donor identifiers when potential donors complete registration forms. The donor ID is automatically generated and propagated to all associated tables in the system.

## Features

### 1. Automatic Donor ID Generation
- **Format**: `PREFIX-YYYY-SEQUENCE` (e.g., `CAS-2025-1001`)
- **Prefix**: Based on AVIS center (first 3 letters)
- **Year**: Current year
- **Sequence**: Auto-incrementing number starting from 1000

### 2. Database Schema Changes
- Added `donor_id` field to `donors` table (VARCHAR(20), UNIQUE)
- Added `donor_id_prefix` field for customization
- Added `donor_id_sequence` field for tracking
- Added `donor_id` field to associated tables:
  - `appointments`
  - `donation_history`
  - `audit_logs`

### 3. Automatic Propagation
- Donor ID is automatically propagated to all associated tables
- Trigger-based updates ensure data consistency
- Foreign key relationships maintained through donor_id

## Database Functions

### `generate_donor_id(p_avis_center VARCHAR)`
Generates a unique donor ID based on the AVIS center.

**Parameters:**
- `p_avis_center`: The AVIS donor center name

**Returns:** Unique donor ID string

**Example:**
```sql
SELECT generate_donor_id('AVIS Casalmaggiore');
-- Returns: CAS-2025-1001
```

### `get_donor_id_by_hash(p_donor_hash_id VARCHAR)`
Retrieves the donor ID for a given hash ID.

**Parameters:**
- `p_donor_hash_id`: The donor's hash ID

**Returns:** Donor ID string or NULL

### `update_donor_id_in_associated_tables(p_donor_hash_id VARCHAR, p_donor_id VARCHAR)`
Updates donor ID in all associated tables.

**Parameters:**
- `p_donor_hash_id`: The donor's hash ID
- `p_donor_id`: The donor ID to propagate

**Returns:** Boolean indicating success

## Updated Registration Function

### `register_donor_with_email()`
The registration function has been updated to:
1. Generate a unique donor ID
2. Store it in the donors table
3. Propagate it to associated tables
4. Return the generated donor ID

**Return Format:**
```sql
RETURNS TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT)
```

**Example Response:**
```json
[
  {
    "donor_id": "CAS-2025-1001",
    "success": true,
    "message": "Registration successful"
  }
]
```

## Frontend Changes

### DonorRegistration Component
- Updated to handle the new registration response format
- Displays the generated donor ID in success messages
- Maintains backward compatibility

### useAuth Hook
- Updated Donor interface to include `donor_id` field
- Login function now fetches and stores donor ID
- Donor ID available throughout the application

## Migration Details

### File: `supabase/migrations/20250630200700_add_donor_id_field.sql`

**What it does:**
1. Adds donor_id columns to donors and associated tables
2. Creates sequence for ID generation
3. Implements ID generation functions
4. Updates registration function
5. Creates triggers for automatic propagation
6. Migrates existing donors with generated IDs

**Safety Features:**
- Uses `IF NOT EXISTS` for all additions
- Backs up existing data
- Handles errors gracefully
- Comprehensive audit logging

## Usage Examples

### 1. Registration Flow
```typescript
// Frontend registration
const { data: result } = await supabase.rpc('register_donor_with_email', {
  p_donor_hash_id: donorHashId,
  p_salt: salt,
  p_email: email,
  p_avis_donor_center: avisCenter
});

if (result[0].success) {
  const donorId = result[0].donor_id;
  console.log('Generated Donor ID:', donorId);
}
```

### 2. Querying by Donor ID
```sql
-- Find donor by ID
SELECT * FROM donors WHERE donor_id = 'CAS-2025-1001';

-- Find appointments for a donor
SELECT * FROM appointments WHERE donor_id = 'CAS-2025-1001';

-- Find donation history
SELECT * FROM donation_history WHERE donor_id = 'CAS-2025-1001';
```

### 3. Manual ID Generation
```sql
-- Generate ID for testing
SELECT generate_donor_id('AVIS Gussola');
-- Returns: GUS-2025-1002
```

## Testing

### Test Script: `test-donor-id.js`
Comprehensive test script that verifies:
- Database schema changes
- Function existence
- ID generation functionality
- Associated table updates
- Sequence creation

**Run with:**
```bash
node test-donor-id.js
```

## Security Considerations

### GDPR Compliance
- Donor ID is not PII (Personal Identifiable Information)
- Hash-based authentication maintained
- No personal data stored in plain text
- Audit trail for all operations

### Access Control
- RLS policies updated for new fields
- Functions use SECURITY DEFINER
- Proper error handling and logging

## Benefits

### 1. User Experience
- Clear, memorable donor identifiers
- Easy reference for donors and staff
- Professional appearance

### 2. Operational Efficiency
- Quick donor lookup by ID
- Consistent identification across tables
- Reduced data entry errors

### 3. System Integration
- Standardized donor identification
- Easy integration with external systems
- Improved data consistency

## Future Enhancements

### 1. Custom ID Formats
- Configurable prefix patterns
- Different formats for different centers
- Barcode/QR code generation

### 2. Advanced Features
- ID reservation system
- Bulk ID generation
- ID validation rules

### 3. Reporting
- Donor ID analytics
- Usage statistics
- Center-specific reports

## Troubleshooting

### Common Issues

#### 1. Duplicate Donor IDs
- Check sequence values
- Verify uniqueness constraints
- Review ID generation logic

#### 2. Missing Associated Table Updates
- Check trigger existence
- Verify function permissions
- Review error logs

#### 3. Registration Failures
- Check function return format
- Verify parameter types
- Review database logs

### Debug Commands
```sql
-- Check donor ID sequence
SELECT last_value FROM donor_id_sequence;

-- Verify donor IDs
SELECT donor_id, COUNT(*) FROM donors GROUP BY donor_id HAVING COUNT(*) > 1;

-- Check associated table updates
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'donor_id';
```

## Support

For issues or questions regarding the Donor ID feature:
1. Check the audit logs for error details
2. Run the test script to verify functionality
3. Review database function definitions
4. Check RLS policies and permissions 