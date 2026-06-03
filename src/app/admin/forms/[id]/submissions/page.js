'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Trash2, UserPlus, Download } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function FormSubmissions() {
  const { id } = useParams();
  const { apiFetch, isSuperAdmin } = useAdminAuth();

  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [creating, setCreating] = useState(null); // submission id being processed

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`${API}/admin/forms/${id}/submissions`);
      if (!res.ok) throw new Error('Failed to load submissions');
      const { form, submissions } = await res.json();
      setForm(form);
      setSubmissions(submissions);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(sub) {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return;
    try {
      const res = await apiFetch(`${API}/admin/forms/${id}/submissions/${sub.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
      if (selectedSubmission?.id === sub.id) setSelectedSubmission(null);
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  async function handleCreateGame(sub) {
    if (sub.processed) {
      alert(`Already processed. Game ID: ${sub.game_id}`);
      return;
    }
    if (!window.confirm('Create a game/team entry from this submission?')) return;
    setCreating(sub.id);
    try {
      const res = await apiFetch(`${API}/admin/forms/${id}/submissions/${sub.id}/create-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create game');
      alert(`✅ Game created: "${data.game.title}" (ID ${data.game.id})`);
      // Refresh submissions to show processed state
      await loadData();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setCreating(null);
    }
  }

  function exportCSV() {
    if (!form || submissions.length === 0) return;
    const fields = Array.isArray(form.fields) ? form.fields : [];
    const headers = ['ID', 'Submitted At', 'Processed', 'Game ID', ...fields.map(f => f.label)];
    const rows = submissions.map(s => {
      const data = s.data || {};
      return [
        s.id,
        new Date(s.submitted_at).toLocaleString(),
        s.processed ? 'Yes' : 'No',
        s.game_id || '',
        ...fields.map(f => {
          const v = data[f.name];
          return Array.isArray(v) ? v.join('; ') : (v ?? '');
        }),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.slug}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Loading…</p></div>;
  if (error) return <div className="text-red-400 p-6">{error}</div>;
  if (!form) return null;

  const fields = Array.isArray(form.fields) ? form.fields : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/forms" className="p-2 hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Submissions</h1>
            <p className="text-gray-400 text-sm mt-1">
              {form.name}
              {form.gamejam_name && <span className="ml-2 text-purple-400">• {form.gamejam_name}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/forms/${id}/builder`}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Edit Form
          </Link>
          {submissions.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-500 text-sm">Total Submissions</p>
          <p className="text-white font-bold text-2xl">{submissions.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-500 text-sm">Processed →  Game</p>
          <p className="text-white font-bold text-2xl">{submissions.filter(s => s.processed).length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-500 text-sm">Pending Review</p>
          <p className="text-white font-bold text-2xl">{submissions.filter(s => !s.processed).length}</p>
        </div>
      </div>

      {/* Jam integration notice */}
      {form.gamejam_id && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 text-sm text-purple-300">
          🎮 This form is linked to <strong>{form.gamejam_name}</strong>. Use the <em>Create Game</em> button on each submission
          to auto-create a team entry in the jam.
          {form.settings?.auto_create_game && (
            <span className="ml-2 text-green-400 font-semibold">(Auto-create is ON — games are created on submission)</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Submissions list */}
        <div className="col-span-2">
          <div className="space-y-2">
            {submissions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <p className="text-gray-400">No submissions yet.</p>
              </div>
            ) : (
              submissions.map(sub => {
                const email = fields.find(f => f.type === 'email');
                const emailVal = email ? sub.data?.[email.name] : null;
                const teamNameField = fields.find(f => f.maps_to === 'team_name');
                const teamName = teamNameField ? sub.data?.[teamNameField.name] : null;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`bg-gray-800 rounded-lg p-4 border cursor-pointer transition-colors ${
                      selectedSubmission?.id === sub.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {teamName || emailVal || `#${sub.id}`}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.processed ? (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                            ✓ Game #{sub.game_id}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submission detail */}
        <div className="col-span-3">
          {!selectedSubmission ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700 h-full flex items-center justify-center">
              <p className="text-gray-500">Select a submission to view details</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 sticky top-4">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Submission #{selectedSubmission.id}</h3>
                  <p className="text-gray-400 text-xs">{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {form.gamejam_id && !selectedSubmission.processed && (
                    <button
                      onClick={() => handleCreateGame(selectedSubmission)}
                      disabled={creating === selectedSubmission.id}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      {creating === selectedSubmission.id ? 'Creating…' : 'Create Game'}
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(selectedSubmission)}
                      className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {selectedSubmission.processed && selectedSubmission.game_id && (
                <div className="px-4 py-3 bg-green-900/20 border-b border-green-700/30 text-sm text-green-300">
                  ✅ Processed — Game #{selectedSubmission.game_id}
                  {selectedSubmission.game_title && ` "${selectedSubmission.game_title}"`}
                  {selectedSubmission.notes && <span className="text-gray-400 ml-2">({selectedSubmission.notes})</span>}
                </div>
              )}

              <div className="p-4 space-y-3">
                {fields.map(field => {
                  const value = selectedSubmission.data?.[field.name];
                  return (
                    <div key={field.name}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {field.label}
                        {field.maps_to && (
                          <span className="ml-2 text-purple-400 normal-case">→ {field.maps_to}</span>
                        )}
                      </p>
                      <p className="text-white text-sm mt-1 break-words">
                        {Array.isArray(value) ? value.join(', ') : (value || <span className="text-gray-500 italic">—</span>)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
