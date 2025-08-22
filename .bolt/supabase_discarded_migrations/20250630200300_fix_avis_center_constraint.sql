/*
  # Fix AVIS Center Constraint Migration

  The current constraint chk_donors_avis_center is checking for outdated center names
  ('Pompano', 'Milan', 'Rome') instead of the actual AVIS centers in the donation_centers table.
  
  This migration:
  1. Drops the outdated constraint
  2. Creates a new constraint that references the actual donation_centers table
  3. Ensures data integrity while allowing valid AVIS centers
*/

-- Drop the outdated constraint
ALTER TABLE donors DROP CONSTRAINT IF EXISTS chk_donors_avis_center;

-- Create a new constraint that references the donation_centers table
ALTER TABLE donors ADD CONSTRAINT chk_donors_avis_center 
CHECK (avis_donor_center IN (
  SELECT name FROM donation_centers WHERE is_active = true
));

-- Create an index to improve constraint performance
CREATE INDEX IF NOT EXISTS idx_donors_avis_center_check 
ON donors(avis_donor_center) 
WHERE avis_donor_center IS NOT NULL;

-- Log the constraint fix
INSERT INTO audit_logs (
  user_id,
  user_type,
  action,
  details,
  resource_type,
  resource_id,
  status
) VALUES (
  'system',
  'system',
  'fix_avis_center_constraint',
  'Fixed AVIS center constraint to reference actual donation_centers table instead of outdated hardcoded values',
  'donors',
  NULL,
  'success'
);

-- Verify the constraint works with existing data
DO $$
DECLARE
  invalid_centers_count INTEGER;
BEGIN
  -- Check if there are any donors with invalid centers
  SELECT COUNT(*) INTO invalid_centers_count
  FROM donors d
  LEFT JOIN donation_centers dc ON d.avis_donor_center = dc.name
  WHERE dc.name IS NULL AND d.avis_donor_center IS NOT NULL;
  
  IF invalid_centers_count > 0 THEN
    RAISE NOTICE 'Found % donors with invalid AVIS centers that need to be updated', invalid_centers_count;
  ELSE
    RAISE NOTICE 'All existing donors have valid AVIS centers';
  END IF;
END $$; 