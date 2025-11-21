import React from 'react';

const Sponsor = ({ className = '', imgClassName = 'h-6 sm:h-8 md:h-10', showText = true, textClasses = 'hidden md:inline', href = 'https://astralshiftpro.com', alt = 'Astral Shift Pro', imgSrc = '/images/astralshift-horizontal.png' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className={`text-xs text-gray-300 uppercase ${textClasses}`}>Proudly sponsored by</span>
      )}
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center" title={alt} aria-label={alt}>
        <img src={imgSrc} alt={alt} className={`${imgClassName} w-auto`} />
      </a>
    </div>
  );
};

export default Sponsor;
