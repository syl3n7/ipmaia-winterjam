'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function PublicFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch(`${API}/forms/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setForm(data);
        // Init form values
        const init = {};
        (data.fields || []).forEach(f => {
          init[f.name] = f.type === 'checkbox' ? [] : '';
        });
        setFormValues(init);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  function handleChange(field, value) {
    setFormValues(prev => ({ ...prev, [field.name]: value }));
    // Clear field-level error on change
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field.name];
      return next;
    });
  }

  function handleCheckboxChange(field, option) {
    setFormValues(prev => {
      const current = prev[field.name] || [];
      if (current.includes(option)) {
        return { ...prev, [field.name]: current.filter(v => v !== option) };
      }
      return { ...prev, [field.name]: [...current, option] };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setFieldErrors({});

    // Client-side required check (UX only — server validates authoritatively)
    const clientErrors = {};
    (form.fields || []).forEach(field => {
      const value = formValues[field.name];
      const missing = !value || (Array.isArray(value) && value.length === 0) || value === '';
      if (field.required && missing) {
        clientErrors[field.name] = `"${field.label}" is required.`;
      }
    });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/forms/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const fe = {};
          data.errors.forEach(msg => {
            // Match "Label" is... pattern
            const match = msg.match(/^"([^"]+)"/);
            if (match) {
              const field = form.fields.find(f => f.label === match[1]);
              if (field) fe[field.name] = msg;
            }
          });
          setFieldErrors(fe);
          setErrors(data.errors);
        } else {
          setErrors([data.error || 'Submission failed.']);
        }
        return;
      }
      setSuccessMessage(data.message || form.success_message);
      setSubmitted(true);
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading form…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-white mb-4">Form Not Found</h1>
        <p className="text-gray-400">This form is not available or has been closed.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 border border-green-700">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-3">Submission Received!</h1>
          <p className="text-gray-300">{successMessage}</p>
          {form.gamejam_name && (
            <p className="mt-4 text-purple-400 text-sm">You have registered for <strong>{form.gamejam_name}</strong>.</p>
          )}
        </div>
      </div>
    );
  }

  const inputBase = "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const errorInputBase = `${inputBase} border-red-500 focus:ring-red-500`;

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Form card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 px-8 py-6 border-b border-gray-700">
            {form.gamejam_name && (
              <p className="text-purple-400 text-sm font-semibold mb-1">🎮 {form.gamejam_name}</p>
            )}
            <h1 className="text-2xl font-bold text-white">{form.name}</h1>
            {form.description && <p className="text-gray-300 mt-2 text-sm">{form.description}</p>}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <ul className="text-red-300 text-sm space-y-1">
                  {errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}

            {(form.fields || []).map(field => {
              const hasError = !!fieldErrors[field.name];
              const inputClass = hasError ? errorInputBase : inputBase;

              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ''}
                      onChange={e => handleChange(field, e.target.value)}
                      className={inputClass}
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      placeholder={field.placeholder || 'email@example.com'}
                      value={formValues[field.name] || ''}
                      onChange={e => handleChange(field, e.target.value)}
                      className={inputClass}
                    />
                  )}

                  {field.type === 'phone' && (
                    <input
                      type="tel"
                      placeholder={field.placeholder || '+351 XXX XXX XXX'}
                      value={formValues[field.name] || ''}
                      onChange={e => handleChange(field, e.target.value)}
                      className={inputClass}
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows="4"
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ''}
                      onChange={e => handleChange(field, e.target.value)}
                      className={inputClass}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={formValues[field.name] || ''}
                      onChange={e => handleChange(field, e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Choose an option…</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            checked={formValues[field.name] === opt}
                            onChange={() => handleChange(field, opt)}
                            className="h-4 w-4 text-blue-500"
                          />
                          <span className="text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="space-y-2">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={(formValues[field.name] || []).includes(opt)}
                            onChange={() => handleCheckboxChange(field, opt)}
                            className="h-4 w-4 text-blue-500"
                          />
                          <span className="text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {hasError && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors[field.name]}</p>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
            >
              {submitting ? 'Submitting…' : (form.submit_button_text || 'Submit')}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by IPMAIA WinterJam
        </p>
      </div>
    </div>
  );
}
