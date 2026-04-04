'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function FormsList() {
  const { apiFetch } = useAdminAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`${API}/admin/forms`);
      if (!res.ok) throw new Error('Failed to load forms');
      setForms(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(form) {
    if (!window.confirm(`Delete "${form.name}" and all its submissions? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API}/admin/forms/${form.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Delete failed');
      }
      setForms(prev => prev.filter(f => f.id !== form.id));
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading forms…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Forms Manager</h1>
          <p className="text-gray-400 mt-1">Create forms, collect registrations, auto-create team entries</p>
        </div>
        <Link
          href="/admin/forms/builder"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Form
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>
      )}

      {/* Forms Grid */}
      <div className="grid gap-4">
        {forms.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400 mb-4">No forms yet. Create one to get started!</p>
            <Link
              href="/admin/forms/builder"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Form
            </Link>
          </div>
        ) : (
          forms.map(form => (
            <div
              key={form.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{form.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      form.status === 'active'
                        ? 'bg-green-600/20 text-green-400'
                        : form.status === 'closed'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {form.status}
                    </span>
                    {form.gamejam_name && (
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-semibold">
                        🎮 {form.gamejam_name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{form.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-gray-500 text-xs font-mono">/forms/{form.slug}</p>
                    {form.status === 'active' && (
                      <a
                        href={`/forms/${form.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        title="Open public form"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-700">
                <div>
                  <p className="text-gray-500 text-sm">Fields</p>
                  <p className="text-white font-semibold text-lg">
                    {Array.isArray(form.fields) ? form.fields.length : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Submissions</p>
                  <p className="text-white font-semibold text-lg">{form.submission_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="text-white font-semibold text-sm">
                    {form.updated_at ? new Date(form.updated_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/admin/forms/${form.id}/builder`}
                  className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded transition-colors text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Link>
                <Link
                  href={`/admin/forms/${form.id}/submissions`}
                  className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Submissions ({form.submission_count ?? 0})
                </Link>
                <button
                  onClick={() => handleDelete(form)}
                  className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded transition-colors text-sm font-medium ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

