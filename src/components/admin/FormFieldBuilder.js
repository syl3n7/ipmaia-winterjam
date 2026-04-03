'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: 'T' },
  { value: 'email', label: 'Email', icon: 'E' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'select', label: 'Select', icon: '▼' },
  { value: 'radio', label: 'Radio', icon: '◉' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑' },
  { value: 'textarea', label: 'Textarea', icon: '⬜' },
];

// Mapping targets — links form fields to game record fields
const MAPS_TO_OPTIONS = [
  { value: '', label: '— none —' },
  { value: 'team_name', label: 'Team Name (game.team_name)' },
  { value: 'title', label: 'Game Title (game.title)' },
  { value: 'description', label: 'Game Description (game.description)' },
  { value: 'team_members', label: 'Team Members — multiline list (game.team_members)' },
  { value: 'member_name', label: 'Individual Member Name (adds to team_members)' },
  { value: 'github_url', label: 'GitHub URL (game.github_url)' },
  { value: 'itch_url', label: 'Itch.io URL (game.itch_url)' },
  { value: 'contact_email', label: 'Contact Email (stored in custom fields)' },
];

export default function FormFieldBuilder({ field, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const fieldTypeConfig = FIELD_TYPES.find(t => t.value === field.type);
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  const handleAddOption = () => {
    const currentOptions = field.options || [];
    onUpdate(field.id, {
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const handleUpdateOption = (optIndex, value) => {
    const newOptions = [...(field.options || [])];
    newOptions[optIndex] = value;
    onUpdate(field.id, { options: newOptions });
  };

  const handleRemoveOption = (optIndex) => {
    const newOptions = field.options?.filter((_, i) => i !== optIndex) || [];
    onUpdate(field.id, { options: newOptions });
  };

  return (
    <div className="bg-gray-700 rounded border border-gray-600 overflow-hidden">
      {/* Field Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg font-bold w-8 text-center text-gray-400">{index + 1}</span>
          <div className="flex-1">
            <p className="text-white font-medium">{field.label}</p>
            <p className="text-gray-400 text-xs">
              {fieldTypeConfig?.label}
              {field.required && ' • Required'}
              {field.maps_to && <span className="text-purple-400"> • maps→{field.maps_to}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            className="p-1 hover:bg-red-600/20 text-red-400 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Field Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-600 space-y-3 bg-gray-750">
          {/* Label */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Field Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Field Name (for database)
            </label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onUpdate(field.id, { name: e.target.value })}
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Field Type
            </label>
            <select
              value={field.type}
              onChange={(e) => onUpdate(field.id, { type: e.target.value })}
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Maps To */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Maps to Game Field <span className="text-purple-400">(for auto team/game creation)</span>
            </label>
            <select
              value={field.maps_to || ''}
              onChange={(e) => onUpdate(field.id, { maps_to: e.target.value })}
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {MAPS_TO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Placeholder */}
          {!hasOptions && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(field.options || []).map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(optIndex, e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleRemoveOption(optIndex)}
                      className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddOption}
                  className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 border border-dashed border-gray-500 rounded text-sm transition-colors"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <label htmlFor={`required-${field.id}`} className="text-sm text-gray-300 cursor-pointer">
              Required field
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

