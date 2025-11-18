/**
 * Donors Routes
 * Privacy-first donor management endpoints
 */

import { Router } from 'express';
import {
  listDonors,
  getDonorByHash,
  getDonorHistory,
  getDonorEligibility,
  addDonorNotes,
  getDonorStats,
  searchDonors,
  listDonorsValidation,
  addNotesValidation,
  searchDonorsValidation,
} from '../controllers/donors.controller.js';
import { requireAuth, requirePermission } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Donor Management Routes
 */
router.get(
  '/donors',
  listDonorsValidation,
  requirePermission('donors:view'),
  listDonors
);

router.get(
  '/donors/stats',
  requirePermission('donors:view'),
  getDonorStats
);

router.post(
  '/donors/search',
  searchDonorsValidation,
  requirePermission('donors:view'),
  searchDonors
);

router.get(
  '/donors/:hash',
  requirePermission('donors:view'),
  getDonorByHash
);

router.get(
  '/donors/:hash/history',
  requirePermission('donors:view'),
  getDonorHistory
);

router.get(
  '/donors/:hash/eligibility',
  requirePermission('donors:view'),
  getDonorEligibility
);

router.put(
  '/donors/:hash/notes',
  addNotesValidation,
  requirePermission('donors:add_notes'),
  addDonorNotes
);

export default router;

