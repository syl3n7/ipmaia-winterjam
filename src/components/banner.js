"use client";

import { Button } from "flowbite-react";


export default function BannerCenter() {
    return (
      <>
        <div className="fixed inset-0 bg-overlay-bg flex items-center justify-center overflow-x-hidden">
          <div className="bg-orange-500 bg-opacity-80 rounded-lg shadow-lg p-8 text-white" style={{ boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }}>
            <h2 className="text-2xl font-bold text-center mb-4">Inscreve-te já!</h2>
            <div className="flex flex-wrap gap-2">
      <Button gradientMonochrome="info">Info</Button>
      <Button gradientMonochrome="success">Success</Button>
      <Button gradientMonochrome="cyan">Cyan</Button>
      <Button gradientMonochrome="teal">Teal</Button>
      <Button gradientMonochrome="lime">Lime</Button>
      <Button gradientMonochrome="failure">Failure</Button>
      <Button gradientMonochrome="pink">Pink</Button>
      <Button gradientMonochrome="purple">Purple</Button>
    </div>
          </div>
        </div>
      </>
    );
  }
  