"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { href: '/admin/gamejams', icon: '🎮', label: 'Manage Game Jams', color: 'bg-blue-600' },
    { href: '/admin/games', icon: '🎯', label: 'Manage Games', color: 'bg-green-600' },
    { href: '/admin/sponsors', icon: '🎪', label: 'Manage Sponsors', color: 'bg-purple-600' },
    { href: '/admin/frontpage', icon: '🏠', label: 'Edit Front Page', color: 'bg-yellow-600' },
    { href: '/admin/rules', icon: '📋', label: 'Manage Rules', color: 'bg-red-600' },
    { href: '/admin/system', icon: '⚙️', label: 'System Settings', color: 'bg-gray-600' },
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

      {/* Quick Links Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.color} hover:opacity-90 rounded-lg p-6 transition-opacity shadow-lg`}
            >
              <div className="text-4xl mb-2">{link.icon}</div>
              <div className="text-white font-semibold">{link.label}</div>
            </Link>
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