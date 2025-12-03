"use client";

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
  const { user, isSuperAdmin } = useAdminAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, admin, super_admin, user
  const [pocketidStatus, setPocketidStatus] = useState(null);

  useEffect(() => {
    // Only super admins can access this page
    if (user && !isSuperAdmin) {
      router.push('/admin');
      return;
    }
    
    if (isSuperAdmin) {
      fetchUsers();
      checkPocketIDStatus();
    }
  }, [user, isSuperAdmin, router]);

  const checkPocketIDStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pocketid/status`, {
        credentials: 'include',
      });
      if (response.ok) {
        const status = await response.json();
        setPocketidStatus(status);
      }
    } catch (error) {
      console.error('Failed to check PocketID status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, userEmail, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?\n\nNote: This creates a local role override. PocketID groups remain unchanged.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole, email: userEmail }),
      });

      if (response.ok) {
        alert('✅ User role updated successfully!');
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(`❌ Failed to update role: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('❌ Failed to update role');
    }
  };

  const handleSyncUsers = async () => {
    if (!confirm('Sync users from PocketID?\n\nThis will add new users from PocketID to the local database.\nExisting user settings will be preserved.')) {
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/sync-from-pocketid`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Sync complete!\n\nCreated: ${result.created}\nSkipped: ${result.skipped}\nTotal: ${result.total}`);
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(`❌ Sync failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing users:', error);
      alert('❌ Failed to sync users');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleActive = async (userId, userEmail, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?\n\nNote: This only affects local access. PocketID account remains active.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        alert(`✅ User ${action}d successfully!`);
        await fetchUsers();
      } else {
        alert(`❌ Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`❌ Failed to ${action} user`);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-white">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>Only super admins can access user management.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.role === filter;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600';
      case 'admin': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return <div className="text-white">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">👥 User Management</h2>
          {pocketidStatus && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${pocketidStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-400">
                {pocketidStatus.connected ? 'Connected to PocketID' : pocketidStatus.configured ? 'PocketID API not responding' : 'PocketID API not configured'}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {pocketidStatus?.connected && (
            <button
              onClick={handleSyncUsers}
              disabled={syncing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? '⏳ Syncing...' : '🔄 Sync from PocketID'}
            </button>
          )}
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-white text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Super Admins</div>
          <div className="text-white text-2xl font-bold">
            {users.filter(u => u.role === 'super_admin').length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Admins</div>
          <div className="text-white text-2xl font-bold">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Regular Users</div>
          <div className="text-white text-2xl font-bold">
            {users.filter(u => u.role === 'user').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Role</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Users</option>
          <option value="super_admin">Super Admins</option>
          <option value="admin">Admins</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {u.username}
                    {u.id === user?.id && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getRoleBadgeColor(u.role)} inline-block w-fit`}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                      {u.groupNames && u.groupNames.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {u.groupNames.map((group, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                              {group}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 whitespace-nowrap">
                    {u.email !== user?.email && (
                      <>
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, u.email, e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          onClick={() => handleToggleActive(u.id, u.email, u.is_active)}
                          className={`px-2 py-1 rounded text-xs ${u.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </>
                    )}
                    {u.email === user?.email && (
                      <span className="text-gray-500 text-xs">Cannot modify yourself</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No users found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">ℹ️ User Management Info</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• <strong>PocketID Sync:</strong> Click &quot;Sync from PocketID&quot; to import users from PocketID API</li>
          <li>• Only users in <code className="bg-gray-800 px-1 rounded">admin</code>, <code className="bg-gray-800 px-1 rounded">ipmaia</code>, or <code className="bg-gray-800 px-1 rounded">users</code> groups are synced</li>
          <li>• <strong>Local Control:</strong> Users are stored locally after sync - you can block/modify them here</li>
          <li>• <strong>Prevent Unauthorized Login:</strong> Deactivate users locally to block their access, even if they&apos;re still in PocketID</li>
          <li>• Super Admin: Requires &quot;admin&quot; group + matching email (<code className="bg-gray-800 px-1 rounded">OIDC_ADMIN_EMAIL</code>)</li>
          <li>• Role changes and deactivations are stored locally and don&apos;t affect PocketID</li>
          <li>• You cannot modify your own account to prevent lockout</li>
          <li>• <strong>Setup:</strong> Add <code className="bg-gray-800 px-1 rounded">POCKETID_API_URL</code> and <code className="bg-gray-800 px-1 rounded">POCKETID_API_KEY</code> to environment</li>
        </ul>
      </div>
    </div>
  );
}
