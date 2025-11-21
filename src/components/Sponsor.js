import React from 'react';

const Sponsor = ({ className = '', imgClassName = 'h-6 sm:h-8 md:h-10', showText = true, textClasses = 'hidden md:inline', href = 'https://astralshiftpro.com', alt = 'Astral Shift Pro', imgSrc = '/images/astralshift-horizontal-dark.png', containerClass = '', isCircular = false }) => {
  // Use an inline-flex anchor and default object-contain for consistency.
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className={`text-xs text-gray-300 uppercase ${textClasses} leading-none`}>Sponsored by</span>
      )}
      <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center ${containerClass}`} title={alt} aria-label={alt}>
        {isCircular ? (
          <div className={`rounded-full overflow-hidden ${imgClassName} aspect-square flex items-center justify-center`}>
            <img src={imgSrc} alt={alt} className="h-full w-full object-cover" />
          </div>
        ) : (
          <img src={imgSrc} alt={alt} className={`${imgClassName} w-auto object-contain align-middle`} />
        )}
      </a>
    </div>
  );
};

export default Sponsor;
