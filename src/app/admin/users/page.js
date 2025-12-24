"use client";

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';

export default function AdminUsers() {
  const { user, isSuperAdmin, apiFetch } = useAdminAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, admin, super_admin, user
  const [registrationEnabled, setRegistrationEnabled] = useState(null);
  const [loadingRegistration, setLoadingRegistration] = useState(true);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteExpires, setInviteExpires] = useState('7d');
  const [inviteSendEmail, setInviteSendEmail] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [inviteResult, setInviteResult] = useState(null);

  useEffect(() => {
    // Only super admins can access this page
    if (user && !isSuperAdmin) {
      router.push('/admin');
      return;
    }
    
    if (isSuperAdmin) {
      fetchUsers();
      fetchRegistrationStatus();
    }
  }, [user, isSuperAdmin, router]);


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE_URL}/admin/users`, {}, 'fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      setLoadingRegistration(true);
      const res = await apiFetch(`${API_BASE_URL}/admin/registration`, {}, 'fetch registration status');
      const payload = await res.json();
      setRegistrationEnabled(payload.enabled);
    } catch (err) {
      console.error('Failed to fetch registration status:', err);
    } finally {
      setLoadingRegistration(false);
    }
  };

  // Helpers for invite modal and registration toggle (moved out of JSX for clarity)
  const handleOpenInviteModal = () => setShowInviteModal(true);
  const handleCloseInvite = () => {
    setShowInviteModal(false);
    setInviteResult(null);
    setInviteError('');
    setInviteUsername('');
    setInviteEmail('');
    setInviteExpires('7d');
    setInviteSendEmail(true);
  };

  const handleCreateInvite = async () => {
    setInviteError('');
    try {
      if (!inviteUsername || !inviteEmail) return setInviteError('Username and email are required');
      const res = await apiFetch(`${API_BASE_URL}/admin/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername, email: inviteEmail, expiresOption: inviteExpires, sendEmail: inviteSendEmail })
      }, 'create invite');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invite failed');

      if (!inviteSendEmail && data && data.inviteLink) {
        try {
          await navigator.clipboard.writeText(data.inviteLink);
          setInviteResult({ ...data, copiedToClipboard: true });
        } catch (copyErr) {
          console.warn('Clipboard copy failed:', copyErr);
          setInviteResult({ ...data, copiedToClipboard: false });
        }
      } else {
        setInviteResult({ ...data, copiedToClipboard: false });
      }

      setInviteError('');
      await fetchUsers();
    } catch (err) {
      setInviteError(err.message);
    }
  };

  const handleToggleRegistrationClick = async () => {
    const confirmMsg = registrationEnabled ? 'Disable public registration? This will prevent new users from registering via the public form.' : 'Enable public registration? New users will be able to register via the public form.';
    if (!confirm(confirmMsg)) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/registration`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !registrationEnabled }),
      }, 'toggle registration');
      const payload = await res.json();
      setRegistrationEnabled(payload.enabled);
      alert(`Public registration ${payload.enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Failed to toggle registration:', err);
      alert('Failed to update registration status');
    }
  };

  const handleChangeRole = async (userId, userEmail, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?\n\nNote: This creates a local role override.`)) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, email: userEmail }),
      }, 'update user role');

      alert('✅ User role updated successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('❌ Failed to update role');
    }
  };

  // PocketID sync removed - disabled
  const handleSyncUsers = async () => {
    alert('PocketID integration is disabled. User sync is not available.');
  };

  const handleToggleActive = async (userId, userEmail, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?\n\nNote: This only affects local access.`)) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/admin/users/${userId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      }, `${action} user`);

      alert(`✅ User ${action}d successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`❌ Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (userId, userEmail, username) => {
    if (!confirm(`⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete ${username} (${userEmail})?\n\nThis will:\n• Remove the user from the local database\n• Cannot be undone\n\nType DELETE to confirm`)) {
      return;
    }

    // Extra confirmation
    const confirmation = prompt('Type DELETE in capital letters to confirm:');
    if (confirmation !== 'DELETE') {
      alert('Delete cancelled - confirmation did not match');
      return;
    }

    try {
const response = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      }, 'delete user');

      alert(`✅ User ${username} deleted successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user');
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
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleOpenInviteModal}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            ✉️ Invite User
          </button>

          {/* Registration Toggle (Super Admin only) */}
          {typeof registrationEnabled === 'boolean' && (
            <button
              onClick={handleToggleRegistrationClick}
              className={`px-3 py-2 rounded ${registrationEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors`}
            >
              {registrationEnabled ? 'Disable Registration' : 'Enable Registration'}
            </button>
          )}
        </div>
      </div>

      <div className="text-white text-lg">Stats</div>
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

      {/* Invite Modal (moved below header for parser simplicity) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Invite a user</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Username" value={inviteUsername} onChange={e => setInviteUsername(e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
              <input type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
              <div className="flex gap-2">
                <label className="text-sm text-gray-300">Expires:</label>
                <select value={inviteExpires} onChange={e => setInviteExpires(e.target.value)} className="bg-gray-900 p-2 rounded text-white">
                  <option value="1h">1 hour</option>
                  <option value="3d">3 days</option>
                  <option value="7d">7 days</option>
                </select>
                <label className="ml-4 text-sm text-gray-300 flex items-center gap-2"><input type="checkbox" checked={inviteSendEmail} onChange={e => setInviteSendEmail(e.target.checked)} /> Send email</label>
              </div>
              {inviteError && <div className="text-red-400">{inviteError}</div>}
              {inviteResult && (
                <div className="text-green-400">
                  Invite created: <a className="text-blue-300" href={inviteResult.inviteLink} target="_blank" rel="noreferrer">Open link</a>
                  {inviteResult.copiedToClipboard && <span className="ml-2 text-sm text-gray-300">— Link copied to clipboard</span>}
                  {!inviteResult.copiedToClipboard && inviteResult.emailSent && <span className="ml-2 text-sm text-gray-300">— Email sent</span>}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={handleCloseInvite} className="px-4 py-2 bg-gray-700 text-white rounded">Cancel</button>
              <button onClick={handleCreateInvite} className="px-4 py-2 bg-green-600 text-white rounded">Create Invite</button>
            </div>
          </div>
        </div>
      )}

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
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email, u.username)}
                          className="px-2 py-1 rounded text-xs bg-red-800 hover:bg-red-900 text-white"
                          title="Permanently delete user"
                        >
                          🗑️ Delete
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

    </div>
  );
}
