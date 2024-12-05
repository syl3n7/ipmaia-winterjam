import { SocialLinks } from './SocialLinks';

const Year = () => {
  const dateobj = new Date();
  return dateobj.getFullYear();
};

const Footer = () => {
  return (
    <footer className="relative z-20 p-4 text-gray-600 flex justify-between items-center">
      <p>© Copyright <Year /> IPMAIA Todos direitos reservados.</p>
      <SocialLinks />
    </footer>
  );
};

export default Footer;