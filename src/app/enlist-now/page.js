import Image from "next/image";

export default function Page() {
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
        Lê o QR Code para te inscreveres nesta aventura !
      </h2>
    </div>
  );
}