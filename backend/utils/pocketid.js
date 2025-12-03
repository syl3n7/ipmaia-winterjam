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

      return await response.json();
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
      await this.request('/healthz');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PocketIDClient();
