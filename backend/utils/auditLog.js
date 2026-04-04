const { pool } = require('../config/database');

/**
 * Helper to extract client info from request
 * @param {Object} req - Express request object
 * @returns {Object} Client info with IP and user agent
 */
function getClientInfo(req) {
  return {
    ipAddress: req.clientInfo?.ip || req.ip || 'unknown',
    userAgent: req.clientInfo?.userAgent || req.get?.('user-agent') || 'unknown'
  };
}

/**
 * Log an action to the audit trail
 * @param {Object} params
 * @param {number} params.userId - User ID performing the action
 * @param {string} params.username - Username performing the action
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} params.tableName - Database table affected
 * @param {number} params.recordId - ID of the record affected
 * @param {string} params.description - Human-readable description
 * @param {Object} params.oldValues - Previous values (for updates/deletes)
 * @param {Object} params.newValues - New values (for creates/updates)
 * @param {string} params.ipAddress - IP address of requester
 * @param {string} params.userAgent - User agent of requester
 * @param {Object} params.req - Express request object (alternative to ipAddress/userAgent)
 */
async function logAudit({
  userId,
  username,
  action,
  tableName = null,
  recordId = null,
  description,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
  req = null
}) {
  // If req is provided, extract client info from it
  if (req && (!ipAddress || !userAgent)) {
    const clientInfo = getClientInfo(req);
    ipAddress = ipAddress || clientInfo.ipAddress;
    userAgent = userAgent || clientInfo.userAgent;
  }
  try {
    await pool.query(
      `INSERT INTO audit_logs (
        user_id, username, action, table_name, record_id, 
        description, old_values, new_values, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        username,
        action,
        tableName,
        recordId,
        description,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    // Don't throw error - audit logging should not break the main operation
    console.error('❌ Failed to write audit log:', error);
    // Retry a few times using a short in-memory queue to handle transient DB hiccups
    try {
      const { enqueueTask } = require('./dbQueue');
      enqueueTask(async () => {
        await pool.query(
          `INSERT INTO audit_logs (
            user_id, username, action, table_name, record_id, 
            description, old_values, new_values, ip_address, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            userId,
            username,
            action,
            tableName,
            recordId,
            description,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            ipAddress,
            userAgent
          ]
        );
      }, { attempts: 5, baseDelayMs: 2000, maxDelayMs: 30000 });
    } catch (enqueueErr) {
      console.error('❌ Failed to enqueue audit log retry:', enqueueErr);
    }
  }
}

/**
 * Get recent audit logs
 * @param {number} limit - Number of logs to retrieve
 * @param {number} offset - Offset for pagination
 * @param {Object} filters - Optional filters (userId, action, tableName)
 */
async function getAuditLogs(limit = 100, offset = 0, filters = {}) {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(filters.action);
    }

    if (filters.tableName) {
      query += ` AND table_name = $${paramIndex++}`;
      params.push(filters.tableName);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Failed to retrieve audit logs:', error);
    return [];
  }
}

/**
 * Get audit log statistics
 */
async function getAuditStats() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7days
      FROM audit_logs
    `);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Failed to get audit stats:', error);
    return {};
  }
}

module.exports = {
  logAudit,
  getAuditLogs,
  getAuditStats,
  getClientInfo
};
