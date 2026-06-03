'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Eye, Save } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import FormFieldBuilder from '@/components/admin/FormFieldBuilder';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function EditFormBuilder() {
  const { id } = useParams();
  const router = useRouter();
  const { apiFetch } = useAdminAuth();

  const [formData, setFormData] = useState(null);
  const [fields, setFields] = useState([]);
  const [gameJams, setGameJams] = useState([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch(`${API}/admin/forms/${id}`).then(r => r.ok ? r.json() : null),
      apiFetch(`${API}/admin/gamejams`).then(r => r.ok ? r.json() : []),
    ]).then(([form, jams]) => {
      if (!form) { setError('Form not found'); setLoading(false); return; }
      const { fields: f, ...rest } = form;
      setFormData({
        ...rest,
        gamejam_id: rest.gamejam_id ?? '',
        settings: rest.settings ?? {},
      });
      setFields(Array.isArray(f) ? f : []);
      setGameJams(jams);
      setLoading(false);
    }).catch(() => { setError('Failed to load form'); setLoading(false); });
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, name, slug: autoSlug }));
  };

  const handleSettingChange = (key, value) => {
    setFormData(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  const addField = () => {
    setFields(prev => [
      ...prev,
      { id: Date.now(), name: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false, maps_to: '', order: prev.length + 1 }
    ]);
  };

  const updateField = (fid, updates) => setFields(prev => prev.map(f => f.id === fid ? { ...f, ...updates } : f));
  const deleteField = (fid) => setFields(prev => prev.filter(f => f.id !== fid));

  const handleSave = async () => {
    setError('');
    if (!formData.name?.trim()) { setError('Form name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        gamejam_id: formData.gamejam_id || null,
        fields: fields.map((f, i) => ({ ...f, order: i + 1 })),
      };
      const res = await apiFetch(`${API}/admin/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      setFormData(prev => ({ ...prev, ...data }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Loading…</p></div>;
  if (!formData) return <div className="text-red-400 p-6">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/forms" className="p-2 hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Form</h1>
            <p className="text-gray-400 text-sm mt-1">{formData.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/forms/${id}/submissions`}
            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            View Submissions
          </Link>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>
      )}

      {preview ? (
        <FormPreview formData={formData} fields={fields} />
      ) : (
        <FormEditorLayout
          formData={formData}
          fields={fields}
          gameJams={gameJams}
          onFormChange={handleFormChange}
          onNameChange={handleNameChange}
          onSettingChange={handleSettingChange}
          onAddField={addField}
          onUpdateField={updateField}
          onDeleteField={deleteField}
        />
      )}
    </div>
  );
}

// ─── Shared Layout ────────────────────────────────────────────────────────────

function FormEditorLayout({ formData, fields, gameJams, onFormChange, onNameChange, onSettingChange, onAddField, onUpdateField, onDeleteField }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Form Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Form Name *</label>
                <input type="text" name="name" value={formData.name} onChange={onNameChange || onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
                <input type="text" name="slug" value={formData.slug || ''} onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={onFormChange} rows="2"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Linked Game Jam <span className="text-purple-400">(auto-game creation)</span>
                </label>
                <select name="gamejam_id" value={formData.gamejam_id || ''} onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500">
                  <option value="">— None —</option>
                  {gameJams.map(gj => <option key={gj.id} value={gj.id}>{gj.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Email</label>
                <input type="email" name="notification_email" value={formData.notification_email || ''} onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Submit Button Text</label>
                <input type="text" name="submit_button_text" value={formData.submit_button_text || 'Submit'} onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Success Message</label>
              <textarea name="success_message" value={formData.success_message || ''} onChange={onFormChange} rows="2"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            {formData.gamejam_id && (
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-purple-300">🎮 Game Jam Integration</h3>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={!!formData.settings?.auto_create_game}
                    onChange={e => onSettingChange('auto_create_game', e.target.checked)} className="h-4 w-4 rounded" />
                  <div>
                    <p className="text-sm font-medium text-gray-200">Auto-create game on submission</p>
                    <p className="text-xs text-gray-400">Instantly creates a team/game in the linked jam using field mappings.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.settings?.send_confirmation_email !== false}
                    onChange={e => onSettingChange('send_confirmation_email', e.target.checked)} className="h-4 w-4 rounded" />
                  <div>
                    <p className="text-sm font-medium text-gray-200">Send confirmation email to submitter</p>
                    <p className="text-xs text-gray-400">Requires Email-type field and SMTP configured.</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Form Fields</h2>
            <button onClick={onAddField}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
              + Add Field
            </button>
          </div>
          {fields.length === 0 && <p className="text-gray-500 text-center py-8">No fields yet.</p>}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FormFieldBuilder key={field.id} field={field} index={index} onUpdate={onUpdateField} onDelete={onDeleteField} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-4 space-y-2">
          <h3 className="text-sm font-bold text-white mb-2">Public URL</h3>
          <code className="text-xs text-green-400 break-all">/forms/{formData.slug}</code>
          <p className="text-xs text-gray-500">Change status to <em>Active</em> to accept submissions.</p>
        </div>
        <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">
            <strong>🎮 Integration:</strong> Set <em>Maps to Game Field</em> on fields to auto-fill team data.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormPreview({ formData, fields }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">{formData.name}</h2>
      {formData.description && <p className="text-gray-400 mb-6">{formData.description}</p>}
      <form className="space-y-4">
        {fields.map(field => <FieldPreviewItem key={field.id} field={field} />)}
        <button type="button" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-6">
          {formData.submit_button_text || 'Submit'}
        </button>
      </form>
    </div>
  );
}

function FieldPreviewItem({ field }) {
  const base = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.type === 'text' && <input type="text" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'email' && <input type="email" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'phone' && <input type="tel" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'textarea' && <textarea rows="3" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'select' && <select className={base} disabled><option>Choose…</option>{field.options?.map(o => <option key={o}>{o}</option>)}</select>}
      {field.type === 'radio' && <div className="space-y-2">{field.options?.map(o => <label key={o} className="flex items-center gap-2"><input type="radio" disabled /><span className="text-gray-300">{o}</span></label>)}</div>}
      {field.type === 'checkbox' && <div className="space-y-2">{field.options?.map(o => <label key={o} className="flex items-center gap-2"><input type="checkbox" disabled /><span className="text-gray-300">{o}</span></label>)}</div>}
    </div>
  );
}
