'use client';
import { useState, useEffect } from 'react';

const Background = ({ imageUrl, fallbackColor = '#f0f0f0', fallbackContent }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setImageLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return (
    <div className="absolute inset-0 z-[-50] flex items-center justify-center">
      {/* Fallback background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: fallbackColor }}
      />
      {/* Main background image */}
      {imageUrl && !hasError && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )}
      {/* Error state */}
      {hasError && fallbackContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackContent}
        </div>
      )}
    </div>
  );
};

export default Background;