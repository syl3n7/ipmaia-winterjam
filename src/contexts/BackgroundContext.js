'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();

export function BackgroundProvider({ children }) {
  const [bannerImage, setBannerImage] = useState('/images/IPMAIA_SiteBanner.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only fetch once when the provider mounts
    if (!isLoaded) {
      const fetchBackground = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const bgImageUrl = `${apiUrl}/frontpage/background`;
          setBannerImage(bgImageUrl);
          setIsLoaded(true);
        } catch (error) {
          // Error fetching background
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBackground();
    } else {
      setIsLoading(false);
    }
  }, [isLoaded]);

  return (
    <BackgroundContext.Provider value={{ bannerImage, isLoading }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
