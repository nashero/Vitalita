/**
 * Analytics and Reports Routes
 */

import { Router } from 'express';
import {
  getDashboardMetrics,
  getDonationTrends,
  getDonorStatistics,
  getCenterPerformance,
  getStaffProductivity,
  analyticsValidation,
} from '../controllers/analytics.controller.js';
import {
  generateReport,
  downloadReport,
  generateReportValidation,
} from '../controllers/reports.controller.js';
import { requireAuth, requirePermission } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Analytics Routes
 */
router.get(
  '/analytics/dashboard',
  analyticsValidation,
  requirePermission('analytics:view'),
  getDashboardMetrics
);

router.get(
  '/analytics/donations',
  analyticsValidation,
  requirePermission('analytics:view'),
  getDonationTrends
);

router.get(
  '/analytics/donors',
  analyticsValidation,
  requirePermission('analytics:view'),
  getDonorStatistics
);

router.get(
  '/analytics/centers',
  analyticsValidation,
  requirePermission('analytics:view'),
  getCenterPerformance
);

router.get(
  '/analytics/staff',
  analyticsValidation,
  requirePermission('analytics:view'),
  getStaffProductivity
);

/**
 * Reports Routes
 */
router.post(
  '/reports/generate',
  generateReportValidation,
  requirePermission('reports:generate'),
  generateReport
);

router.get(
  '/reports/:id/download',
  requirePermission('reports:view'),
  downloadReport
);

export default router;

