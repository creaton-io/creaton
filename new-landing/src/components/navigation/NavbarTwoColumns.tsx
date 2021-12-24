import { ReactNode, useEffect, useState } from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

type INavbarProps = {
  logo: ReactNode;
  children: ReactNode;
};

export default function NavbarTwoColumns(props: INavbarProps) {
  const [path, setPath] = useState('');
  const router = useRouter();

  useEffect(() => {
    setPath(router.pathname);
  }, [])
  return (
    <div className="flex flex-wrap justify-between items-center">
      <div className='flex items-center text-white'>
        <Link href="/">
          <a>{props.logo}</a>
        </Link>
        <Link href="/">
          <a className='ml-10 text-base'>Creators</a>
        </Link>
        <Link href="/partner">
          <a className={path == '/partner' ? 'mx-5 text-base active relative' : 'mx-5 text-base'}>Partners</a>
        </Link>
      </div>

      <nav>
        <ul className="navbar flex items-center font-medium text-xl text-gray-800">
          {props.children}
        </ul>
      </nav>

      <style jsx>
        {`
      .navbar :global(li:not(:first-child)) {
        @apply mt-0;
      }

      .navbar :global(li:not(:last-child)) {
        @apply mr-5;
      }
    `}
      </style>
    </div>
  )
}

export { NavbarTwoColumns };
