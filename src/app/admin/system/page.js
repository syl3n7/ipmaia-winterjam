"use client";

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useState, useEffect } from 'react';

export default function AdminSystem() {
  const { user, isSuperAdmin } = useAdminAuth();
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditStats, setAuditStats] = useState(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    loadSystemInfo();
    if (isSuperAdmin) {
      loadAuditLogs();
      loadMaintenanceStatus();
    }
  }, [isSuperAdmin]);

  const loadMaintenanceStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/maintenance`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.enabled);
      }
    } catch (error) {
      console.error('Failed to load maintenance status:', error);
    }
  };

  const loadSystemInfo = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Extract base URL from API URL (remove /api suffix if present)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const baseUrl = apiUrl.replace(/\/api$/, '');

      const [gameJamsRes, gamesRes, sponsorsRes, healthRes] = await Promise.allSettled([
        fetch(`${apiUrl}/admin/gamejams`, {
          credentials: 'include',
        }),
        fetch(`${apiUrl}/admin/games`, {
          credentials: 'include',
        }),
        fetch(`${apiUrl}/sponsors/admin`, {
          credentials: 'include',
        }),
        fetch(`${baseUrl}/health`),
      ]);

      const responseTime = Date.now() - startTime;

      const gameJams =
        gameJamsRes.status === 'fulfilled' && gameJamsRes.value.ok
          ? await gameJamsRes.value.json()
          : [];
      const games =
        gamesRes.status === 'fulfilled' && gamesRes.value.ok
          ? await gamesRes.value.json()
          : [];
      const sponsors =
        sponsorsRes.status === 'fulfilled' && sponsorsRes.value.ok
          ? (await sponsorsRes.value.json()).sponsors || []
          : [];
      const health =
        healthRes.status === 'fulfilled' && healthRes.value.ok
          ? await healthRes.value.json()
          : { status: 'Error' };

      setSystemData({
        health,
        gameJams,
        games,
        sponsors,
        responseTime,
      });
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to load system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSystemInfo();
  };

  const handleExportReport = () => {
    if (!systemData) return;

    const report = {
      timestamp: new Date().toISOString(),
      system: {
        status: systemData.health.status || 'Unknown',
        version: systemData.health.version || '1.0.0',
      },
      database: {
        gameJams: systemData.gameJams.length,
        games: systemData.games.length,
        sponsors: systemData.sponsors.length,
      },
      performance: {
        responseTime: `${systemData.responseTime}ms`,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = async () => {
    if (!confirm('⚠️ Are you sure you want to clear the server cache? This will force refresh all cached data.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/clear-cache`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        alert('✅ Cache cleared successfully!');
        await loadSystemInfo();
      } else {
        const error = await response.json();
        alert(`❌ Failed to clear cache: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('❌ Failed to clear cache. Check console for details.');
    }
  };

  const handleRestartServer = async () => {
    if (!confirm('⚠️ DANGER: This will restart the backend server. All active sessions will be disconnected. Continue?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/restart`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        alert('✅ Server restart initiated. Please wait 10-15 seconds and refresh the page.');
      } else {
        const error = await response.json();
        alert(`❌ Failed to restart server: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to restart server:', error);
      alert('❌ Failed to restart server. Check console for details.');
    }
  };

  const handleExportDatabase = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/export/all`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('✅ Database exported successfully!');
      } else {
        alert('❌ Failed to export database');
      }
    } catch (error) {
      console.error('Failed to export database:', error);
      alert('❌ Failed to export database. Check console for details.');
    }
  };

  const handleImportDatabase = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!confirm('⚠️ WARNING: This will import data and may overwrite existing records. Continue?')) {
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          alert(`✅ Import completed!\n\nGame Jams: ${result.gamejams_imported}\nGames: ${result.games_imported}\n${result.errors.length > 0 ? '\nErrors: ' + result.errors.length : ''}`);
          await loadSystemInfo();
        } else {
          const error = await response.json();
          alert(`❌ Import failed: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Failed to import: ' + error.message);
      }
    };
    input.click();
  };

  const handleToggleMaintenanceMode = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/maintenance`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setMaintenanceMode(result.enabled);
        alert(`✅ ${result.message}`);
        await loadSystemInfo();
      } else {
        alert('❌ Failed to toggle maintenance mode');
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      alert('❌ Failed to toggle maintenance mode');
    }
  };

  const handleTestDatabase = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/test-db`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Database Test Results:\n\nConnection: ${result.connection ? 'OK' : 'FAILED'}\nQuery Test: ${result.query ? 'OK' : 'FAILED'}\nResponse Time: ${result.responseTime}ms`);
      } else {
        alert('❌ Database test failed');
      }
    } catch (error) {
      console.error('Database test error:', error);
      alert('❌ Database test failed: ' + error.message);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs?limit=50`, {
          credentials: 'include',
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs/stats`, {
          credentials: 'include',
        }),
      ]);

      if (logsRes.ok) {
        const logs = await logsRes.json();
        setAuditLogs(logs);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAuditStats(stats);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const isHealthy = systemData?.health?.status === 'OK';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">⚙️ System Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            📊 Export Report
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">💚 System Health</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isHealthy
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {isHealthy ? 'Healthy' : 'Error'}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={isHealthy ? 'text-green-400' : 'text-red-400'}>
                {isHealthy ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">
                {systemData?.health?.version || '1.0.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Check</span>
              <span className="text-white">{lastCheck.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">🗄️ Database</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
              Connected
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Game Jams</span>
              <span className="text-white font-semibold">
                {systemData?.gameJams?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Games</span>
              <span className="text-white font-semibold">
                {systemData?.games?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sponsors</span>
              <span className="text-white font-semibold">
                {systemData?.sponsors?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">⚡ Performance</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
              Good
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time</span>
              <span className="text-white font-semibold">
                {systemData?.responseTime || 0}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Users</span>
              <span className="text-white font-semibold">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory</span>
              <span className="text-white">N/A</span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">💾 Storage</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
              Available
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Uploads</span>
              <span className="text-white">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Files</span>
              <span className="text-white">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Disk Usage</span>
              <span className="text-white">N/A</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">👤 Current User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Username</p>
            <p className="text-white font-semibold">{user?.username || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Role</p>
            <p className="text-white font-semibold capitalize">
              {user?.role || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-semibold">{user?.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          🔧 System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Environment</p>
            <p className="text-white font-mono bg-gray-700 px-3 py-1 rounded inline-block">
              {process.env.NODE_ENV || 'development'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">API URL</p>
            <p className="text-white font-mono bg-gray-700 px-3 py-1 rounded inline-block text-xs">
              {process.env.NEXT_PUBLIC_API_URL}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Frontend URL</p>
            <p className="text-white font-mono bg-gray-700 px-3 py-1 rounded inline-block text-xs">
              {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Platform</p>
            <p className="text-white font-mono bg-gray-700 px-3 py-1 rounded inline-block">
              Next.js + Express
            </p>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <>
          {/* Database Tools */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              💾 Database Management
            </h3>
            <p className="text-gray-300 mb-4">
              Export, import, and manage database operations. Always backup before major changes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Export Database */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">📤 Export</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Download full database backup as JSON file.
                </p>
                <button 
                  onClick={handleExportDatabase}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Export Database
                </button>
              </div>

              {/* Import Database */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">📥 Import</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Restore database from JSON backup file.
                </p>
                <button 
                  onClick={handleImportDatabase}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Import Database
                </button>
              </div>

              {/* Test Database */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">🧪 Test</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Test database connection and query performance.
                </p>
                <button 
                  onClick={handleTestDatabase}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>

          {/* System Operations */}
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              🔐 System Operations
            </h3>
            <p className="text-gray-300 mb-4">
              Critical system operations. Use with caution as these affect all users.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clear Cache */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">🗑️ Clear Cache</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Clear server-side cache. Forces fresh data load on next request.
                </p>
                <button 
                  onClick={handleClearCache}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                >
                  Clear Server Cache
                </button>
              </div>

              {/* Maintenance Mode */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">🚧 Maintenance Mode</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Toggle maintenance mode. Visitors will see maintenance page. Admin panel remains accessible.
                </p>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    maintenanceMode 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {maintenanceMode ? '🚧 ENABLED' : '✅ DISABLED'}
                  </span>
                </div>
                <button 
                  onClick={handleToggleMaintenanceMode}
                  className={`w-full px-4 py-2 text-white rounded transition-colors ${
                    maintenanceMode
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </button>
              </div>

              {/* Restart Server */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">🔄 Restart Server</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Restart the backend server. All sessions will disconnect.
                </p>
                <button 
                  onClick={handleRestartServer}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Restart Backend
                </button>
              </div>

              {/* User Management */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">👥 User Management</h4>
                <p className="text-gray-400 text-sm mb-3">
                  View registered users and manage their roles.
                </p>
                <button 
                  onClick={() => window.location.href = '/admin/users'}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>

          {/* Activity / Audit Trail */}
          <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                📜 Activity & Audit Trail
              </h3>
              <button
                onClick={() => setShowAuditLogs(!showAuditLogs)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                {showAuditLogs ? '👁️ Hide Logs' : '👁️ View Logs'}
              </button>
            </div>

            {auditStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Total Logs</div>
                  <div className="text-white text-xl font-bold">{auditStats.total_logs || 0}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Last 24h</div>
                  <div className="text-white text-xl font-bold">{auditStats.last_24h || 0}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Last 7 Days</div>
                  <div className="text-white text-xl font-bold">{auditStats.last_7days || 0}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Unique Users</div>
                  <div className="text-white text-xl font-bold">{auditStats.unique_users || 0}</div>
                </div>
              </div>
            )}

            {showAuditLogs && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Table</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-700">
                          <td className="px-4 py-2 text-gray-300 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-gray-300">
                            {log.username || 'System'}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.action === 'CREATE' ? 'bg-green-600' :
                              log.action === 'UPDATE' ? 'bg-blue-600' :
                              log.action === 'DELETE' ? 'bg-red-600' :
                              'bg-gray-600'
                            } text-white`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-300">
                            {log.table_name || '-'}
                          </td>
                          <td className="px-4 py-2 text-gray-300">
                            {log.description}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                            No audit logs found. Activity will appear here once the audit system is active.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-gray-400 text-sm mt-4">
              <strong>Note:</strong> Run the audit log migration to enable activity tracking: 
              <code className="ml-2 bg-gray-800 px-2 py-1 rounded">node backend/migrations/add-audit-log.js</code>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
