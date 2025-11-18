/**
 * Appointments Routes
 */

import { Router } from 'express';
import {
  listAppointments,
  getAppointment,
  getCalendarData,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
  exportAppointments,
  listAppointmentsValidation,
  createAppointmentValidation,
  updateAppointmentValidation,
  updateStatusValidation,
} from '../controllers/appointments.controller.js';
import { requireAuth, requirePermission } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Appointment Management Routes
 */
router.get(
  '/appointments',
  listAppointmentsValidation,
  requirePermission('appointments:view'),
  listAppointments
);

router.get(
  '/appointments/calendar',
  requirePermission('appointments:view'),
  getCalendarData
);

router.get(
  '/appointments/stats',
  requirePermission('appointments:view'),
  getAppointmentStats
);

router.get(
  '/appointments/export',
  requirePermission('appointments:export'),
  exportAppointments
);

router.get(
  '/appointments/:id',
  requirePermission('appointments:view'),
  getAppointment
);

router.post(
  '/appointments',
  createAppointmentValidation,
  requirePermission('appointments:create'),
  createAppointment
);

router.put(
  '/appointments/:id',
  updateAppointmentValidation,
  requirePermission('appointments:update'),
  updateAppointment
);

router.patch(
  '/appointments/:id/status',
  updateStatusValidation,
  requirePermission('appointments:update'),
  updateAppointmentStatus
);

export default router;

