/**
 * Example usage of RBAC middleware in Express routes
 * 
 * This file demonstrates various patterns for using the RBAC middleware
 */

import { Router } from 'express';
import {
  requireAuth,
  requireRole,
  requirePermission,
  requireOrgLevel,
  requireSameCenter,
  requireAuthAndPermission,
  requireAuthAndRole,
  requireAuthRoleAndPermission,
} from '../middleware/rbac.middleware.js';

const router = Router();

// Example 1: Simple authentication required
router.get('/profile', requireAuth, async (req, res) => {
  // User is authenticated, access req.user
  res.json({ user: req.user });
});

// Example 2: Require specific permission
router.get('/appointments', requireAuth, requirePermission('appointments:view'), async (req, res) => {
  // User has appointments:view permission
  res.json({ appointments: [] });
});

// Example 3: Require specific role
router.get('/financial', requireAuth, requireRole('Treasurer', 'President'), async (req, res) => {
  // User has Treasurer or President role
  res.json({ financial: {} });
});

// Example 4: Require role AND permission
router.put('/financial/:id', 
  requireAuth, 
  requireRole('Treasurer', 'President'),
  requirePermission('financial:manage_budget'),
  async (req, res) => {
    // User has required role AND permission
    res.json({ success: true });
  }
);

// Example 5: Using combined middleware helpers
router.get('/donors', 
  ...requireAuthAndPermission('donors:view'),
  async (req, res) => {
    res.json({ donors: [] });
  }
);

router.post('/staff', 
  ...requireAuthAndRole('PRESIDENT', 'VP'),
  async (req, res) => {
    res.json({ success: true });
  }
);

router.delete('/centers/:id',
  ...requireAuthRoleAndPermission(['PRESIDENT'], ['centers:delete']),
  async (req, res) => {
    res.json({ success: true });
  }
);

// Example 6: Organizational level requirement
router.get('/national-reports',
  requireAuth,
  requireOrgLevel('National', 'Regional'),
  async (req, res) => {
    // Only National or Regional level users can access
    res.json({ reports: [] });
  }
);

// Example 7: Center-based access control
router.get('/centers/:center_id/appointments',
  requireAuth,
  requirePermission('appointments:view'),
  requireSameCenter('center_id'), // center_id from URL params
  async (req, res) => {
    // User can only access appointments from their center or hierarchical children
    const centerId = req.params.center_id;
    res.json({ appointments: [] });
  }
);

// Example 8: Complex combination
router.post('/centers/:center_id/staff',
  requireAuth,
  requireOrgLevel('National', 'Regional', 'Provincial'), // Must be at least Provincial
  requireRole('CENTER_MGR', 'PRESIDENT'),
  requirePermission('staff:manage'),
  requireSameCenter('center_id'),
  async (req, res) => {
    // Complex requirements:
    // - Authenticated
    // - At least Provincial level
    // - Has CENTER_MGR or PRESIDENT role
    // - Has staff:manage permission
    // - Can access the specified center
    res.json({ success: true });
  }
);

// Example 9: Different ways to specify center_id
router.get('/appointments',
  requireAuth,
  requirePermission('appointments:view'),
  requireSameCenter('center_id'), // Checks req.params.center_id, req.query.center_id, or req.body.center_id
  async (req, res) => {
    // Can be called with:
    // GET /appointments?center_id=xxx
    // POST /appointments with { center_id: xxx } in body
    // GET /appointments/:center_id
    res.json({ appointments: [] });
  }
);

// Example 10: Medical staff accessing donor medical records
router.get('/donors/:donor_id/medical',
  requireAuth,
  requireRole('SELECTION_PHYSICIAN', 'REGISTERED_NURSE', 'HCD'),
  requirePermission('donors:view_medical'),
  async (req, res) => {
    // Only medical staff with view_medical permission
    res.json({ medical: {} });
  }
);

// Example 11: Financial operations
router.post('/financial/approve',
  requireAuth,
  requireRole('Treasurer', 'President'),
  requirePermission('financial:approve_expenses'),
  requireOrgLevel('National', 'Regional', 'Provincial'),
  async (req, res) => {
    // Treasurer or President at Regional+ level with approve permission
    res.json({ success: true });
  }
);

// Example 12: System administration
router.get('/admin/users',
  requireAuth,
  requireRole('SYSTEM_ADMIN', 'PRESIDENT'),
  requirePermission('users:view'),
  async (req, res) => {
    // System admin or President with users:view
    res.json({ users: [] });
  }
);

export default router;

