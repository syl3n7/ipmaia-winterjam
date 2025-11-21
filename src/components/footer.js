import { SocialLinks } from './SocialLinks';
import Sponsor from './Sponsor';

const Year = () => {
  const dateobj = new Date();
  return dateobj.getFullYear();
};

const Footer = () => {
  return (
    <footer className="w-full z-20 p-4 text-gray-600 flex items-center justify-between bg-white/80 backdrop-blur-sm mt-auto">
      <p>© Copyright <Year /> IPMAIA Todos direitos reservados.</p>

      {/* Footer sponsor: show on sm+ screens; hide on xs (mobile) */}
      <div className="hidden sm:flex flex-col sm:flex-row items-center gap-3">
        <Sponsor imgClassName="h-8 sm:h-10 md:h-12" showText={true} href="https://astralshiftpro.com" alt="Astral Shift Pro" />
      </div>

      <SocialLinks />
    </footer>
  );
};

export default Footer;