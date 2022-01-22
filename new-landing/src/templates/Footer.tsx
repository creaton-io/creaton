import Link from 'next/link';

import { Background } from '../components/background/Background';
import { Section } from '../layout/Section';
import { SiGmail } from "react-icons/si";
import { FaTwitter, FaDiscord, FaTelegramPlane, FaGithub } from "react-icons/fa";

const Footer = () => (
  <Background color="footer-container bg-transparent w-full max-w-md mx-auto w-full">
    <Section yPadding='py-12'>
      <ul className='flex justify-end'>
        <li className='ml-6'>
          <Link href="mailto:contact@creaton.io">
            <a><SiGmail size='20px' fill='#312880' /></a>
          </Link>
        </li>
        <li className='ml-6'>
          <Link href="https://twitter.com/creaton_io">
            <a><FaTwitter size='20px' fill='#312880' /></a>
          </Link>
        </li>
        <li className='ml-6'>
          <Link href="https://discord.gg/krSNH2SghC">
            <a><FaDiscord size='20px' fill='#312880' /></a>
          </Link>
        </li>
        <li className='ml-6'>
          <Link href="https://t.me/creaton_io">
            <a><FaTelegramPlane size='20px' fill='#312880' /></a>
          </Link>
        </li>
        <li className='ml-6'>
          <Link href="https://github.com/creaton-io/creaton">
            <a><FaGithub size='20px' fill='#312880' /></a>
          </Link>
        </li>
      </ul>
    </Section>
  </Background>
);

export { Footer };
