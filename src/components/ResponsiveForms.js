'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";

const MICROSOFT_FORM_URL = "https://forms.office.com/r/zVxFKjwV9S";
const MOBILE_BREAKPOINT = 640;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      });
    };

    handleResize();
    const optimizedResize = () => {
      let timeoutId;
      return () => {
        cancelAnimationFrame(timeoutId);
        timeoutId = requestAnimationFrame(handleResize);
      };
    };

    const resizeHandler = optimizedResize();
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(handleResize);
    };
  }, []);

  return isMobile;
};

const FormSection = () => (
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

const QRCodeSection = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white">
    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] transition-all duration-300 ease-in-out hover:scale-105">
      <Image
        src="/images/QRCodeWinterJam.png"
        alt="QR code para inscrição"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 640px) 300px, 400px"
        quality={90}
      />
    </div>
    <h2 className="mt-6 text-xl sm:text-2xl text-center font-medium">
      Lê o QR Code para te inscreveres nesta aventura!
    </h2>
  </div>
);

const ResponsiveForm = () => {
  const isMobile = useIsMobile();
  
  return isMobile ? <QRCodeSection /> : <FormSection />;
};

export default ResponsiveForm;