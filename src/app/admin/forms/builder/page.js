'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Eye, Save } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import FormFieldBuilder from '@/components/admin/FormFieldBuilder';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const DEFAULT_FORM = {
  name: '',
  slug: '',
  description: '',
  notification_email: '',
  submit_button_text: 'Submit',
  success_message: 'Thank you! Your submission has been received.',
  status: 'draft',
  gamejam_id: '',
  settings: {
    auto_create_game: false,
    send_confirmation_email: true,
  },
};

export default function FormBuilder() {
  const router = useRouter();
  const { apiFetch } = useAdminAuth();

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [fields, setFields] = useState([]);
  const [gameJams, setGameJams] = useState([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`${API}/admin/gamejams`)
      .then(r => r.ok ? r.json() : [])
      .then(setGameJams)
      .catch(() => {});
  }, []);

  const handleFormDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSettingChange = (key, value) => {
    setFormData(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, name, slug: autoSlug }));
  };

  const addField = () => {
    const newField = {
      id: Date.now(),
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      maps_to: '',
      order: fields.length + 1,
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (id, updates) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setError('');
    if (!formData.name.trim()) {
      setError('Form name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        gamejam_id: formData.gamejam_id || null,
        fields: fields.map((f, i) => ({ ...f, order: i + 1 })),
      };
      const res = await apiFetch(`${API}/admin/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save form');
        return;
      }
      router.push(`/admin/forms/${data.id}/builder`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/forms" className="p-2 hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">New Form</h1>
            <p className="text-gray-400 text-sm mt-1">Design your form by adding and configuring fields</p>
          </div>
        </div>
        <div className="flex gap-2">
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
            {saving ? 'Saving…' : 'Create Form'}
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
          onFormChange={handleFormDataChange}
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

// ─── Shared layout component ────────────────────────────────────────────────────

function FormEditorLayout({ formData, fields, gameJams, onFormChange, onNameChange, onSettingChange, onAddField, onUpdateField, onDeleteField }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Form Configuration */}
      <div className="col-span-2 space-y-6">
        {/* Form Settings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Form Settings</h2>
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Form Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onNameChange || onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. WinterJam 2025 Registration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="auto-generated-slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onFormChange}
                rows="2"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active (accepting submissions)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Linked Game Jam <span className="text-purple-400">(for auto-game creation)</span>
                </label>
                <select
                  name="gamejam_id"
                  value={formData.gamejam_id || ''}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">— None —</option>
                  {gameJams.map(gj => (
                    <option key={gj.id} value={gj.id}>{gj.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Email</label>
                <input
                  type="email"
                  name="notification_email"
                  value={formData.notification_email}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Submit Button Text</label>
                <input
                  type="text"
                  name="submit_button_text"
                  value={formData.submit_button_text}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Success Message</label>
              <textarea
                name="success_message"
                value={formData.success_message}
                onChange={onFormChange}
                rows="2"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Integration Settings */}
            {formData.gamejam_id && (
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-purple-300">🎮 Game Jam Integration</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!formData.settings?.auto_create_game}
                    onChange={e => onSettingChange('auto_create_game', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-200">Auto-create game on submission</p>
                    <p className="text-xs text-gray-400">Immediately creates a game/team record in the linked jam when the form is submitted. Use field mappings below to control what data flows through.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings?.send_confirmation_email !== false}
                    onChange={e => onSettingChange('send_confirmation_email', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-200">Send confirmation email to submitter</p>
                    <p className="text-xs text-gray-400">Requires an Email-type field in the form and SMTP configured.</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Form Fields</h2>
            <button
              onClick={onAddField}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-gray-500 text-center py-8">No fields yet. Click &ldquo;Add Field&rdquo; to start.</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FormFieldBuilder
                key={field.id}
                field={field}
                index={index}
                onUpdate={onUpdateField}
                onDelete={onDeleteField}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Tips */}
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Field Types</h3>
          {[
            ['T', 'blue', 'Text', 'Single-line text'],
            ['E', 'green', 'Email', 'Email with validation'],
            ['📱', 'purple', 'Phone', 'Phone number'],
            ['▼', 'yellow', 'Select', 'Single-choice dropdown'],
            ['◉', 'orange', 'Radio', 'Single-choice visible list'],
            ['☑', 'red', 'Checkbox', 'Multiple selections'],
            ['⬜', 'gray', 'Textarea', 'Long text / multiline'],
          ].map(([icon, color, name, desc]) => (
            <div key={name} className="flex items-start gap-2 text-sm">
              <span className={`text-${color}-400 font-semibold w-5 text-center`}>{icon}</span>
              <div>
                <p className="text-white font-medium leading-none">{name}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">
            <strong>🎮 Integration Tip:</strong> Set <em>Maps to Game Field</em> on each field to auto-populate team/game data when creating entries from submissions.
          </p>
        </div>

        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>📧 Emails:</strong> Confirmation and admin notification emails are sent automatically if SMTP is configured in System Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function FormPreview({ formData, fields }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">{formData.name || 'Untitled Form'}</h2>
      {formData.description && <p className="text-gray-400 mb-6">{formData.description}</p>}
      <form className="space-y-4">
        {fields.map(field => (
          <FieldPreviewItem key={field.id} field={field} />
        ))}
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mt-6"
        >
          {formData.submit_button_text || 'Submit'}
        </button>
      </form>
    </div>
  );
}

function FieldPreviewItem({ field }) {
  const base = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.type === 'text' && <input type="text" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'email' && <input type="email" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'phone' && <input type="tel" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'textarea' && <textarea rows="3" placeholder={field.placeholder} className={base} disabled />}
      {field.type === 'select' && (
        <select className={base} disabled>
          <option>Choose…</option>
          {field.options?.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      )}
      {field.type === 'radio' && (
        <div className="space-y-2">
          {field.options?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
              <input type="radio" disabled className="h-4 w-4" />
              <span className="text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {field.options?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
              <input type="checkbox" disabled className="h-4 w-4" />
              <span className="text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
