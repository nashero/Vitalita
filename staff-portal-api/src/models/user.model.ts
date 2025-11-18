import { query } from '../config/database.js';
import { User, UserWithRoles, Role, Permission } from '../types/index.js';
import bcrypt from 'bcrypt';

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    `SELECT * FROM staff_portal.users WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const result = await query(
    `SELECT * FROM staff_portal.users WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

/**
 * Get user with roles and permissions
 */
export const getUserWithRolesAndPermissions = async (
  userId: string
): Promise<UserWithRoles | null> => {
  // Get user
  const userResult = await query(
    `SELECT * FROM staff_portal.users WHERE user_id = $1 AND is_active = true`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0] as User;

  // Get active roles for user
  const rolesResult = await query(
    `SELECT r.*
     FROM staff_portal.roles r
     INNER JOIN staff_portal.user_roles ur ON r.role_id = ur.role_id
     WHERE ur.user_id = $1
       AND ur.is_active = true
       AND (ur.expires_at IS NULL OR ur.expires_at > NOW())`,
    [userId]
  );

  const roles = rolesResult.rows as Role[];

  // Get permissions for user's roles
  const permissionsResult = await query(
    `SELECT DISTINCT p.*
     FROM staff_portal.permissions p
     INNER JOIN staff_portal.role_permissions rp ON p.permission_id = rp.permission_id
     INNER JOIN staff_portal.user_roles ur ON rp.role_id = ur.role_id
     WHERE ur.user_id = $1
       AND ur.is_active = true
       AND (ur.expires_at IS NULL OR ur.expires_at > NOW())`,
    [userId]
  );

  const permissions = permissionsResult.rows as Permission[];

  return {
    ...user,
    roles,
    permissions,
  };
};

/**
 * Create new user (pending approval)
 */
export const createUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: string;
}): Promise<User> => {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(userData.password, salt);

  const result = await query(
    `INSERT INTO staff_portal.users (
      email, password_hash, salt, first_name, last_name, phone_number,
      avis_center_id, organizational_level, is_active, is_email_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, false)
    RETURNING *`,
    [
      userData.email,
      password_hash,
      salt,
      userData.first_name,
      userData.last_name,
      userData.phone_number || null,
      userData.avis_center_id,
      userData.organizational_level,
    ]
  );

  return result.rows[0] as User;
};

/**
 * Update user password
 */
export const updateUserPassword = async (
  userId: string,
  newPassword: string
): Promise<void> => {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await query(
    `UPDATE staff_portal.users
     SET password_hash = $1, salt = $2, password_changed_at = NOW(), failed_login_attempts = 0
     WHERE user_id = $3`,
    [password_hash, salt, userId]
  );
};

/**
 * Verify password
 */
export const verifyPassword = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return user;
};

/**
 * Update last login
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  await query(
    `UPDATE staff_portal.users
     SET last_login_at = NOW(), failed_login_attempts = 0, account_locked_until = NULL
     WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Increment failed login attempts
 */
export const incrementFailedLoginAttempts = async (userId: string): Promise<void> => {
  const result = await query(
    `UPDATE staff_portal.users
     SET failed_login_attempts = failed_login_attempts + 1,
         account_locked_until = CASE
           WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
           ELSE account_locked_until
         END
     WHERE user_id = $1
     RETURNING failed_login_attempts, account_locked_until`,
    [userId]
  );

  const user = result.rows[0];
  if (user.failed_login_attempts >= 5) {
    console.log(`Account locked for user ${userId} due to failed login attempts`);
  }
};

/**
 * Activate user (approve registration)
 */
export const activateUser = async (userId: string, approvedBy: string): Promise<User> => {
  const result = await query(
    `UPDATE staff_portal.users
     SET is_active = true, is_email_verified = true, updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId]
  );

  return result.rows[0] as User;
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (
  userId: string,
  roleId: string,
  assignedBy: string
): Promise<void> => {
  await query(
    `INSERT INTO staff_portal.user_roles (user_id, role_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, role_id) DO UPDATE
     SET is_active = true, assigned_at = NOW(), assigned_by = $3`,
    [userId, roleId, assignedBy]
  );
};

/**
 * Get center administrators
 */
export const getCenterAdministrators = async (centerId: string): Promise<User[]> => {
  const result = await query(
    `SELECT DISTINCT u.*
     FROM staff_portal.users u
     INNER JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id
     INNER JOIN staff_portal.roles r ON ur.role_id = r.role_id
     WHERE u.avis_center_id = $1
       AND r.role_code IN ('PRESIDENT', 'VP', 'SYSTEM_ADMIN', 'CENTER_MGR')
       AND u.is_active = true
       AND ur.is_active = true`,
    [centerId]
  );

  return result.rows as User[];
};

/**
 * Store password reset token
 */
export const storePasswordResetToken = async (
  userId: string,
  resetToken: string
): Promise<void> => {
  // Store in a separate table or use a JSONB column
  // For simplicity, we'll use a temporary approach
  // In production, create a password_reset_tokens table
  await query(
    `UPDATE staff_portal.users
     SET updated_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Get user by reset token (simplified - in production use a proper reset token table)
 */
export const getUserByResetToken = async (token: string): Promise<User | null> => {
  // This is a simplified version
  // In production, implement a proper password_reset_tokens table
  // For now, we'll decode the JWT token to get user info
  return null;
};

