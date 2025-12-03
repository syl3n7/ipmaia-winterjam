const fetch = require('node-fetch');

class PocketIDClient {
  constructor() {
    this.baseUrl = process.env.POCKETID_API_URL; // e.g., https://id.example.com
    this.apiKey = process.env.POCKETID_API_KEY;
  }

  async request(endpoint, options = {}) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('PocketID API not configured. Set POCKETID_API_URL and POCKETID_API_KEY');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`PocketID API error: ${response.status} - ${error}`);
      }

      // For health check endpoints, don't try to parse JSON
      if (options.expectJson === false) {
        return response;
      }

      // Try to parse as JSON, return empty object if response is empty
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {};
      }
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn(`⚠️  Response from ${endpoint} is not valid JSON: ${text}`);
        return { rawResponse: text };
      }
    } catch (error) {
      console.error('❌ PocketID API request failed:', error);
      throw error;
    }
  }

  // Get all users (with pagination)
  async getUsers(page = 1, pageSize = 50) {
    return await this.request(`/api/users?page=${page}&pageSize=${pageSize}`);
  }

  // Get specific user by ID
  async getUserById(userId) {
    return await this.request(`/api/users/${userId}`);
  }

  // Get user's groups
  async getUserGroups(userId) {
    return await this.request(`/api/users/${userId}/groups`);
  }

  // Get all user groups
  async getAllGroups(page = 1, pageSize = 50) {
    return await this.request(`/api/user-groups?page=${page}&pageSize=${pageSize}`);
  }

  // Get specific group by ID
  async getGroupById(groupId) {
    return await this.request(`/api/user-groups/${groupId}`);
  }

  // Filter users by admin-related groups only
  async getAdminUsers() {
    try {
      const usersResponse = await this.getUsers(1, 100);
      const adminUsers = [];

      for (const user of usersResponse.items || []) {
        const userGroups = await this.getUserGroups(user.id);
        const groupNames = userGroups.map(g => g.name.toLowerCase());
        
        // Only include users with admin, ipmaia, or users groups
        if (groupNames.includes('admin') || 
            groupNames.includes('ipmaia') || 
            groupNames.includes('users')) {
          adminUsers.push({
            ...user,
            groups: userGroups,
            groupNames: groupNames
          });
        }
      }

      return adminUsers;
    } catch (error) {
      console.error('❌ Failed to fetch admin users from PocketID:', error);
      return [];
    }
  }

  // Get audit logs from PocketID
  async getAuditLogs(page = 1, pageSize = 50) {
    return await this.request(`/api/audit-logs?page=${page}&pageSize=${pageSize}`);
  }

  // Check if API is configured and working
  async healthCheck() {
    try {
      // Try multiple common health check endpoints
      const endpoints = ['/healthz', '/health', '/api/health', '/api/healthz'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.request(endpoint, { expectJson: false });
          if (response.ok || response.status === 200) {
            console.log(`✅ PocketID health check passed on ${endpoint}`);
            return true;
          }
        } catch (err) {
          // Try next endpoint
          continue;
        }
      }
      
      // If all health checks fail, try to get users as a fallback test
      console.log('⚠️  Health endpoints failed, trying to fetch users as fallback...');
      await this.getUsers(1, 1);
      console.log('✅ PocketID connection verified via user fetch');
      return true;
    } catch (error) {
      console.error('❌ PocketID health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new PocketIDClient();
