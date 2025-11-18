/**
 * Integration tests for RBAC middleware
 * 
 * These tests require a test database and should be run with a test environment
 * 
 * To run: npm test -- rbac.middleware.integration.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { query } from '../config/database.js';
import { canUserAccessCenter } from '../middleware/rbac.middleware.js';

describe('RBAC Middleware Integration Tests', () => {
  let testUserId: string;
  let nationalCenterId: string;
  let regionalCenterId: string;
  let provincialCenterId: string;
  let municipalCenterId: string;

  beforeAll(async () => {
    // Setup test data
    // Create test centers
    const nationalResult = await query(
      `INSERT INTO staff_portal.avis_centers 
       (center_code, name, center_type, country, region)
       VALUES ('TEST-NAT-001', 'Test National', 'National', 'Italy', 'Test Region')
       RETURNING center_id`,
      []
    );
    nationalCenterId = nationalResult.rows[0].center_id;

    const regionalResult = await query(
      `INSERT INTO staff_portal.avis_centers 
       (center_code, name, center_type, parent_center_id, country, region)
       VALUES ('TEST-REG-001', 'Test Regional', 'Regional', $1, 'Italy', 'Test Region')
       RETURNING center_id`,
      [nationalCenterId]
    );
    regionalCenterId = regionalResult.rows[0].center_id;

    const provincialResult = await query(
      `INSERT INTO staff_portal.avis_centers 
       (center_code, name, center_type, parent_center_id, country, region, province)
       VALUES ('TEST-PROV-001', 'Test Provincial', 'Provincial', $1, 'Italy', 'Test Region', 'Test Province')
       RETURNING center_id`,
      [regionalCenterId]
    );
    provincialCenterId = provincialResult.rows[0].center_id;

    const municipalResult = await query(
      `INSERT INTO staff_portal.avis_centers 
       (center_code, name, center_type, parent_center_id, country, region, province)
       VALUES ('TEST-MUN-001', 'Test Municipal', 'Municipal', $1, 'Italy', 'Test Region', 'Test Province')
       RETURNING center_id`,
      [provincialCenterId]
    );
    municipalCenterId = municipalResult.rows[0].center_id;

    // Create test user
    const userResult = await query(
      `INSERT INTO staff_portal.users 
       (email, password_hash, salt, first_name, last_name, avis_center_id, organizational_level, is_active)
       VALUES ('test@example.com', 'hash', 'salt', 'Test', 'User', $1, 'Municipal', true)
       RETURNING user_id`,
      [municipalCenterId]
    );
    testUserId = userResult.rows[0].user_id;
  });

  afterAll(async () => {
    // Cleanup test data
    await query(`DELETE FROM staff_portal.users WHERE user_id = $1`, [testUserId]);
    await query(`DELETE FROM staff_portal.avis_centers WHERE center_id IN ($1, $2, $3, $4)`, [
      nationalCenterId,
      regionalCenterId,
      provincialCenterId,
      municipalCenterId,
    ]);
  });

  describe('canUserAccessCenter', () => {
    it('should allow municipal user to access their own center', async () => {
      const canAccess = await canUserAccessCenter(testUserId, municipalCenterId);
      expect(canAccess).toBe(true);
    });

    it('should deny municipal user from accessing different municipal center', async () => {
      // Create another municipal center
      const otherMunicipalResult = await query(
        `INSERT INTO staff_portal.avis_centers 
         (center_code, name, center_type, parent_center_id, country, region, province)
         VALUES ('TEST-MUN-002', 'Other Municipal', 'Municipal', $1, 'Italy', 'Test Region', 'Test Province')
         RETURNING center_id`,
        [provincialCenterId]
      );
      const otherMunicipalId = otherMunicipalResult.rows[0].center_id;

      const canAccess = await canUserAccessCenter(testUserId, otherMunicipalId);
      expect(canAccess).toBe(false);

      // Cleanup
      await query(`DELETE FROM staff_portal.avis_centers WHERE center_id = $1`, [otherMunicipalId]);
    });

    it('should allow national user to access any center', async () => {
      // Create national user
      const nationalUserResult = await query(
        `INSERT INTO staff_portal.users 
         (email, password_hash, salt, first_name, last_name, avis_center_id, organizational_level, is_active)
         VALUES ('national@example.com', 'hash', 'salt', 'National', 'User', $1, 'National', true)
         RETURNING user_id`,
        [nationalCenterId]
      );
      const nationalUserId = nationalUserResult.rows[0].user_id;

      const canAccess = await canUserAccessCenter(nationalUserId, municipalCenterId);
      expect(canAccess).toBe(true);

      // Cleanup
      await query(`DELETE FROM staff_portal.users WHERE user_id = $1`, [nationalUserId]);
    });
  });
});

