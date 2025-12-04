'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Settings } from 'lucide-react';

export default function FormsList() {
  const [forms, setForms] = useState([
    {
      id: 1,
      name: 'WinterJam 2025 Registration',
      slug: 'winterjam-2025-registration',
      description: 'Main team registration form for WinterJam 2025',
      status: 'active',
      submissionCount: 12,
      fields: 18,
      createdAt: '2025-12-01',
      updatedAt: '2025-12-04'
    }
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      setForms(forms.filter(form => form.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Forms Manager</h1>
          <p className="text-gray-400 mt-1">Create and manage custom forms with email notifications</p>
        </div>
        <Link
          href="/admin/forms/builder"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Form
        </Link>
      </div>

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
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{form.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      form.status === 'active'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {form.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{form.description}</p>
                  <p className="text-gray-500 text-xs mt-2 font-mono">{form.slug}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-700">
                <div>
                  <p className="text-gray-500 text-sm">Fields</p>
                  <p className="text-white font-semibold text-lg">{form.fields}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Submissions</p>
                  <p className="text-white font-semibold text-lg">{form.submissionCount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="text-white font-semibold text-sm">{form.updatedAt}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
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
                  Submissions ({form.submissionCount})
                </Link>
                <Link
                  href={`/admin/forms/${form.id}/settings`}
                  className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded transition-colors text-sm font-medium"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={() => handleDelete(form.id)}
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

      {/* Info Box */}
      <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">💡 About Forms</h4>
        <p className="text-blue-300/80 text-sm">
          Create professional forms with email notifications. Submissions are automatically stored and can be exported as CSV.
          Configure SMTP settings in System Settings to enable email confirmations.
        </p>
      </div>
    </div>
  );
}
