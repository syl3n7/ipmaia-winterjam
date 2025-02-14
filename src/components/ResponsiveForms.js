'use client';

import React, { useState } from 'react';
import { ExternalLink } from "lucide-react";

const MICROSOFT_FORM_URL = "https://forms.office.com/r/zVxFKjwV9S";

const ResponsiveForm = () => {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="w-full h-screen bg-white relative">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <button
          onClick={() => window.open(MICROSOFT_FORM_URL, '_blank')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          <span className="hidden sm:inline">Open in New Tab</span>
          <span className="sm:hidden">Form</span>
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      
      <iframe
        src={MICROSOFT_FORM_URL}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        title="Microsoft Form"
        loading="eager"
        aria-label="Microsoft Form for registration"
        onError={handleIframeError}
      />
      
      {iframeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
          <div className="text-center p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Unable to load the form</h2>
            <button
              onClick={() => window.open(MICROSOFT_FORM_URL, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Open Form in New Tab <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveForm;