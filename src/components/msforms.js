import { useEffect, useState } from 'react';
import Image from "next/image";

const MICROSOFT_FORM_URL = "https://forms.office.com/r/zVxFKjwV9S";

const ResponsiveForm = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  if (isMobile) {
    return (
      <div className="w-full h-screen">
        <iframe
          src={MICROSOFT_FORM_URL}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        >
          Loading...
        </iframe>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
        <Image
          src="/images/QRCodeWinterJam.png"
          alt="QR code para inscrição"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h2 className="mt-6 text-xl sm:text-2xl text-center">
        Lê o QR Code para te inscreveres nesta aventura!
      </h2>
    </div>
  );
};

export default ResponsiveForm;