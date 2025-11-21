import { SocialLinks } from './SocialLinks';
import Sponsor from './Sponsor';

const Year = () => {
  const dateobj = new Date();
  return dateobj.getFullYear();
};

const Footer = () => {
  return (
    <footer className="w-full z-20 p-4 text-gray-600 flex items-center justify-between bg-white/80 backdrop-blur-sm mt-auto">
      <p>© Copyright <Year /> <a className="text-orange-500 hover:text-orange-600" href="https://ipmaia.pt">IPMAIA</a> Todos direitos reservados.</p>
      <SocialLinks />
    </footer>
  );
};

export default Footer;