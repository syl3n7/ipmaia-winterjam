"use client";
import Link from "next/link";
import logo from "../../public/images/WinterJam_Logo_BlackV02.png";
import Image from "next/image";
import { Button } from "flowbite-react";
import { useState } from "react";
const Navbar = () => {
  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);
  return (
    <nav className="bg-gradient-to-r from-[#81C9F0] to-[#1E3A8A] bg-opacity-80 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center pl-20">
        <div className="text-white text-lg font-bold">
          <Link typeof="" href="/">
            <Image src={logo} alt="Logo" width={50} height={50} />
          </Link>
        </div>
        <div className="space-x-12 flex pr-20">
          <Button
            outline={!hover1}
            className={`button-transparent transition duration-1000 ${
              !hover1 ? "bg-black" : ""
            }`}
            onMouseEnter={() => setHover1(true)}
            onMouseLeave={() => setHover1(false)}
            gradientDuoTone="greenToBlue"
            href="/enlist-now"
          >
            Enlist Now
          </Button>
          <Button
            outline={!hover2}
            className={`button-transparent transition duration-1000 ${
              !hover2 ? "bg-black" : ""
            }`}
            onMouseEnter={() => setHover2(true)}
            onMouseLeave={() => setHover2(false)}
            gradientDuoTone="greenToBlue"
            href="/rules"
          >
            Rules
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
