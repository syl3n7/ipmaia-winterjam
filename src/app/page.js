import Image from "next/image";
import Link from "next/link";
import backgroundImage from "../../public/images/IPMAIA_SiteBanner.png";
import { Navbar } from "@/components/navbar";
import BannerCenter from "@/components/banner";



export default function Home() {
  return (
    <>
    <div
        className="z-[-50]"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      </div>
      <BannerCenter/>

    </>
  );
}
