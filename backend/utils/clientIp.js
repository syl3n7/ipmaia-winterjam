/**
 * Returns the real client IP address from the request.
 *
 * When a reverse proxy is used, Express's req.ip reflects the proxy's IP
 * unless trust proxy is configured.  The clientInfo middleware in server.js
 * already extracts the IP from X-Forwarded-For / X-Real-IP headers and stores
 * it on req.clientInfo.ip, so we prefer that value first.
 *
 * The final fallback '0.0.0.0' is intentional: requests that genuinely have no
 * identifiable source IP are grouped into a single rate-limit bucket that is
 * still enforced (not bypassed).
 *
 * @param {import('express').Request} req
 * @returns {string} Client IP address
 */
function getClientIp(req) {
  return (req.clientInfo && req.clientInfo.ip) ||
         req.ip ||
         req.connection.remoteAddress ||
         '0.0.0.0';
}

module.exports = { getClientIp };
