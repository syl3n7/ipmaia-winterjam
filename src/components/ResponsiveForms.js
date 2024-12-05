'use client';

import { useEffect, useState } from 'react';

const MICROSOFT_FORM_URL = "https://forms.office.com/r/zVxFKjwV9S";

const ResponsiveForm = () => {
  return (
    <div className="w-full h-screen bg-white">
      <iframe
        src={MICROSOFT_FORM_URL}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        title="Microsoft Form"
        loading="eager"
        aria-label="Microsoft Form for registration"
      />
    </div>
  );
};

export default ResponsiveForm;