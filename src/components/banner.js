"use client";

import { Button } from "flowbite-react";
import { useState } from "react";

export default function BannerCenter() {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleEnlist = () => {
        setIsClicked(true);
        // Reset the clicked state after animation
        setTimeout(() => setIsClicked(false), 500);
        window.open("https://steelchunk.eu/enlist-now", "_blank", "noopener,noreferrer");
    };

    return (
      <>
        <div className="fixed inset-0 bg-overlay-bg flex items-center justify-center overflow-x-hidden">
          <div className="bg-orange-500 bg-opacity-80 rounded-lg shadow-lg p-8 text-white transform transition-all duration-300 hover:shadow-2xl" 
               style={{ boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }}>
            <h2 className="text-2xl font-bold text-center mb-4 transform transition-all duration-300 hover:scale-105">
              Inscreve-te já!
            </h2>
            <div className="flex flex-col items-center gap-4">
              <Button 
                gradientMonochrome="success"
                onClick={handleEnlist}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                  w-48 h-12 text-lg font-semibold
                  transform transition-all duration-300 ease-in-out
                  ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
                  ${isClicked ? 'scale-95 opacity-80' : ''}
                  hover:shadow-xl
                  active:scale-95
                  focus:ring-4 focus:ring-green-300
                  dark:focus:ring-green-900
                  relative overflow-hidden
                `}
              >
                <span className={`
                  absolute inset-0 bg-gradient-to-r from-green-400 to-green-600
                  transition-opacity duration-300
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}/>
                <span className="relative z-10">
                  Enlist Now!
                </span>
              </Button>
              <div className={`
                transform transition-all duration-300
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
              `}>
                <p className="text-sm text-white/90 italic">
                  Click to join the adventure!
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
}