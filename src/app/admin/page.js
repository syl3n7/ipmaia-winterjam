"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { handleApiResponse } = useAdminAuth();

  useEffect(() => {
    fetchStats();
    checkMaintenanceMode();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
        {
          credentials: 'include',
        }
      );

      await handleApiResponse(response, 'fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Don't show alert for stats fetch errors, just log them
    } finally {
      setLoading(false);
    }
  };

  const checkMaintenanceMode = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/maintenance/status`,
        { credentials: 'include' }
      );
      await handleApiResponse(response, 'check maintenance status');
      const data = await response.json();
      setMaintenanceMode(data.enabled);
    } catch (error) {
      console.error('Failed to check maintenance mode:', error);
      // Don't show alert for maintenance check errors
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/maintenance/toggle`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      await handleApiResponse(response, 'toggle maintenance mode');
      const data = await response.json();
      setMaintenanceMode(data.enabled);
      alert(data.enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      alert(`Failed to toggle maintenance mode: ${error.message}`);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear the application cache?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/cache/clear`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      await handleApiResponse(response, 'clear cache');
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert(`Failed to clear cache: ${error.message}`);
    }
  };

  const quickActions = [
    {
      icon: '🎮',
      label: 'Create Game Jam',
      color: 'bg-blue-600',
      action: () => window.location.href = '/admin/gamejams',
      description: 'Add a new game jam event'
    },
    {
      icon: '🎯',
      label: 'Add Game Entry',
      color: 'bg-green-600',
      action: () => window.location.href = '/admin/games',
      description: 'Submit a new game to the archive'
    },
    {
      icon: '🎪',
      label: 'Add Sponsor',
      color: 'bg-purple-600',
      action: () => window.location.href = '/admin/sponsors',
      description: 'Add a new sponsor partnership'
    },
    {
      icon: maintenanceMode ? '🔧' : '⚡',
      label: maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance',
      color: maintenanceMode ? 'bg-red-600' : 'bg-orange-600',
      action: toggleMaintenanceMode,
      description: maintenanceMode ? 'Take site out of maintenance mode' : 'Put site in maintenance mode'
    },
    {
      icon: '🧹',
      label: 'Clear Cache',
      color: 'bg-indigo-600',
      action: clearCache,
      description: 'Clear application cache for fresh data'
    },
    {
      icon: '📊',
      label: 'View Analytics',
      color: 'bg-teal-600',
      action: () => window.location.href = '/admin/system',
      description: 'Check system analytics and logs'
    },
    {
      icon: '📝',
      label: 'Create Form',
      color: 'bg-pink-600',
      action: () => window.location.href = '/admin/forms',
      description: 'Build a new custom form'
    },
    {
      icon: '🎡',
      label: 'Manage Raffle',
      color: 'bg-cyan-600',
      action: () => window.location.href = '/admin/raffle',
      description: 'Configure raffle wheel settings'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h2>
        <p className="text-gray-400">
          Here&apos;s an overview of your IPMAIA WinterJam admin dashboard
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} hover:opacity-90 rounded-lg p-6 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-left group`}
              title={action.description}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
              <div className="text-white font-semibold text-lg">{action.label}</div>
              <div className="text-white/80 text-sm mt-1">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
        
        {loading ? (
          <div className="text-gray-400">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-green-400 text-2xl font-bold">✅ Online</div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm mb-1">Your Role</div>
              <div className="text-white text-2xl font-bold capitalize">{user?.role}</div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm mb-1">API Status</div>
              <div className="text-green-400 text-2xl font-bold">Connected</div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm mb-1">Last Login</div>
              <div className="text-white text-lg font-bold">Just now</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity / Notes */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">📝 Quick Notes</h3>
        <ul className="space-y-2 text-gray-300">
          <li>• Use the sidebar to navigate between different admin sections</li>
          <li>• All changes are saved automatically to the database</li>
          <li>• Click &quot;Back to Site&quot; to view the public website</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  );
}