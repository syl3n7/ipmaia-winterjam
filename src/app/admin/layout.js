"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    // Content Management
    { href: '/admin', label: '📊 Dashboard', section: 'dashboard' },
    { href: '/admin/gamejams', label: '🎮 Game Jams', section: 'gamejams' },
    { href: '/admin/games', label: '🎯 Games', section: 'games' },
    { href: '/admin/sponsors', label: '🎪 Sponsors', section: 'sponsors' },
    { href: '/admin/forms', label: '📝 Forms', section: 'forms', disabled: true },
    
    // Configuration
    { href: '/admin/frontpage', label: '🏠 Front Page', section: 'frontpage' },
    { href: '/admin/rules', label: '📋 Rules', section: 'rules' },
    { href: '/admin/themes', label: '🎨 Jam Themes', section: 'themes' },
    
    // Features
    { href: '/admin/raffle', label: '🎡 Raffle Wheel', section: 'raffle', disabled: true },
    
    // System & Administration
    { href: '/admin/system', label: '⚙️ System', section: 'system' },
  ];

  // Add Users link only for super admins
  if (isSuperAdmin) {
    navItems.push({ href: '/admin/users', label: '👥 Users', section: 'users' });
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">🎮 Admin Panel</h2>
          {user && (
            <div className="text-sm text-gray-300 bg-gray-700 rounded p-2">
              <p className="font-semibold">👤 {user.username}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Content Management */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Content Management
            </h3>
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.section}
                  href={item.href}
                  onClick={(e) => { if (item.disabled) e.preventDefault(); setSidebarOpen(false); }}
                  className={`block px-4 py-3 rounded-lg transition-colors mb-1 ${
                    isActive && !item.disabled
                      ? 'bg-blue-600 text-white'
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Configuration */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Configuration
            </h3>
            {navItems.slice(5, 8).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.section}
                  href={item.href}
                  onClick={(e) => { if (item.disabled) e.preventDefault(); setSidebarOpen(false); }}
                  className={`block px-4 py-3 rounded-lg transition-colors mb-1 ${
                    isActive && !item.disabled
                      ? 'bg-blue-600 text-white'
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Features */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Features
            </h3>
            {navItems.slice(8, 9).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.section}
                  href={item.href}
                  onClick={(e) => { if (item.disabled) e.preventDefault(); setSidebarOpen(false); }}
                  className={`block px-4 py-3 rounded-lg transition-colors mb-1 ${
                    isActive && !item.disabled
                      ? 'bg-blue-600 text-white'
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* System & Administration */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              System & Administration
            </h3>
            {navItems.slice(9, 10).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.section}
                  href={item.href}
                  onClick={(e) => { if (item.disabled) e.preventDefault(); setSidebarOpen(false); }}
                  className={`block px-4 py-3 rounded-lg transition-colors mb-1 ${
                    isActive && !item.disabled
                      ? 'bg-blue-600 text-white'
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Users (Super Admin Only) */}
            {isSuperAdmin && navItems.length > 10 && (
              <Link
                href="/admin/users"
                onClick={() => setSidebarOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors mb-1 ${
                  pathname === '/admin/users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                👥 Users
              </Link>
            )}
          </div>
        </nav>        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white hover:bg-gray-700 p-2 rounded"
            >
              <span className="text-2xl">☰</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                🎮 IPMAIA WinterJam Admin
              </h1>
              <p className="text-sm text-gray-400">Content Management System</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Back to Site
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminProtectedRoute>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminProtectedRoute>
    </AdminAuthProvider>
  );
}