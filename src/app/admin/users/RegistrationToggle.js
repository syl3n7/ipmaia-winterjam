"use client";

import React from 'react';

export default function RegistrationToggle({ enabled, onToggle, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded text-sm ${enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
        {enabled ? 'Public Registration: Enabled' : 'Public Registration: Disabled'}
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`px-3 py-1 rounded ${enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white text-sm`}
      >
        {enabled ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}