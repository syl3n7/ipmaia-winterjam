'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Eye } from 'lucide-react';
import FormFieldBuilder from '@/components/admin/FormFieldBuilder';

export default function FormBuilder() {
  const [formData, setFormData] = useState({
    name: 'WinterJam 2025 Registration',
    slug: 'winterjam-2025-registration',
    description: 'Main team registration form for WinterJam 2025',
    notificationEmail: 'registrations@ipmaia-winterjam.pt',
    submitButtonText: 'Submit Registration',
    successMessage: 'Thank you! Your registration has been received.',
  });

  const [fields, setFields] = useState([
    {
      id: 1,
      name: 'teamName',
      label: 'Team Name',
      type: 'text',
      required: true,
      placeholder: 'Enter team name',
      order: 1
    },
    {
      id: 2,
      name: 'teamSize',
      label: 'Team Size',
      type: 'select',
      required: true,
      options: ['2 Elements', '3 Elements', '4 Elements'],
      order: 2
    },
    {
      id: 3,
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'contact@example.com',
      order: 3
    },
    {
      id: 4,
      name: 'phone',
      label: 'Phone (Optional)',
      type: 'phone',
      required: false,
      placeholder: '+351 XXX XXX XXX',
      order: 4
    },
    {
      id: 5,
      name: 'attendance',
      label: 'Will you attend the full event?',
      type: 'radio',
      required: true,
      options: ['Yes', 'Partial', 'Unsure'],
      order: 5
    },
    {
      id: 6,
      name: 'equipment',
      label: 'Equipment needed',
      type: 'checkbox',
      required: false,
      options: ['Extensions', 'Digital tables', 'PCs'],
      order: 6
    }
  ]);

  const [preview, setPreview] = useState(false);

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addField = () => {
    const newField = {
      id: Math.max(...fields.map(f => f.id), 0) + 1,
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      order: Math.max(...fields.map(f => f.order), 0) + 1
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    console.log('Form saved:', { formData, fields });
    alert('Form saved! (Dev mode - not persisted)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/forms"
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Form Builder</h1>
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Save Form
          </button>
        </div>
      </div>

      {preview ? (
        <FormPreview formData={formData} fields={fields} />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Form Configuration */}
          <div className="col-span-2 space-y-6">
            {/* Form Settings */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Form Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Form Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormDataChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Slug (auto-generated from name)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleFormDataChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormDataChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notification Email (receive submissions at this email)
                  </label>
                  <input
                    type="email"
                    name="notificationEmail"
                    value={formData.notificationEmail}
                    onChange={handleFormDataChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Success Message (shown after submission)
                  </label>
                  <textarea
                    name="successMessage"
                    value={formData.successMessage}
                    onChange={handleFormDataChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Form Fields</h2>
                <button
                  onClick={addField}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <FormFieldBuilder
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={updateField}
                    onDelete={deleteField}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick Reference */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-4">
              <h3 className="text-sm font-bold text-white mb-3">Field Types</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-semibold">T</span>
                  <div>
                    <p className="text-white font-medium">Text</p>
                    <p className="text-gray-400 text-xs">Single line text input</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-semibold">E</span>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-xs">Email validation included</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-semibold">📱</span>
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-gray-400 text-xs">Phone number validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 font-semibold">▼</span>
                  <div>
                    <p className="text-white font-medium">Select</p>
                    <p className="text-gray-400 text-xs">Single choice dropdown</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 font-semibold">◉</span>
                  <div>
                    <p className="text-white font-medium">Radio</p>
                    <p className="text-gray-400 text-xs">Single choice, multiple options visible</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold">☑</span>
                  <div>
                    <p className="text-white font-medium">Checkbox</p>
                    <p className="text-gray-400 text-xs">Multiple selections</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>💡 Tip:</strong> Email confirmations will be sent to users using Brevo SMTP when form is submitted.
              </p>
            </div>

            <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                <strong>📊 Info:</strong> All submissions are stored and can be viewed in the Submissions section.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormPreview({ formData, fields }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">{formData.name}</h2>
      <p className="text-gray-400 mb-6">{formData.description}</p>

      <form className="space-y-4">
        {fields.map(field => (
          <FormFieldPreview key={field.id} field={field} />
        ))}
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mt-6"
        >
          {formData.submitButtonText}
        </button>
      </form>
    </div>
  );
}

function FormFieldPreview({ field }) {
  const baseInputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {field.label}
        {field.required && <span className="text-red-400">*</span>}
      </label>

      {field.type === 'text' && (
        <input type="text" placeholder={field.placeholder} className={baseInputClass} disabled />
      )}
      {field.type === 'email' && (
        <input type="email" placeholder={field.placeholder} className={baseInputClass} disabled />
      )}
      {field.type === 'phone' && (
        <input type="tel" placeholder={field.placeholder} className={baseInputClass} disabled />
      )}
      {field.type === 'select' && (
        <select className={baseInputClass} disabled>
          <option>Choose option...</option>
          {field.options?.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      )}
      {field.type === 'radio' && (
        <div className="space-y-2">
          {field.options?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
              <input type="radio" className="h-4 w-4" disabled />
              <span className="text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {field.options?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" disabled />
              <span className="text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
