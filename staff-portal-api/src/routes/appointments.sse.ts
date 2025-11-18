/**
 * Server-Sent Events (SSE) endpoint for real-time appointment updates
 */

import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { requireAuth } from '../middleware/rbac.middleware.js';
import { query } from '../config/database.js';

const router = Router();

// Store active SSE connections
const clients = new Map<string, Response>();

/**
 * GET /api/staff/appointments/stream
 * SSE endpoint for real-time appointment updates
 */
router.get('/appointments/stream', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.user_id;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Store connection
  clients.set(userId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to appointment stream' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(userId);
    res.end();
  });
});

/**
 * Broadcast appointment update to all connected clients
 */
export function broadcastAppointmentUpdate(data: {
  type: 'appointment_created' | 'appointment_updated' | 'appointment_status_changed' | 'appointment_cancelled';
  appointment: any;
}) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.write(message);
    } catch (error) {
      // Client disconnected, remove from map
      // Note: We can't identify which client failed, so we'll clean up on next write
    }
  });
}

/**
 * Broadcast new arrival notification
 */
export function broadcastNewArrival(data: {
  appointment_id: string;
  donor_hash_id: string;
  center_id: string;
  center_name: string;
}) {
  broadcastAppointmentUpdate({
    type: 'appointment_status_changed',
    appointment: {
      ...data,
      status: 'arrived',
      notification: 'New donor arrival',
    },
  });
}

export default router;

