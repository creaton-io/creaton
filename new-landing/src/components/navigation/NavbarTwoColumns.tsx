import {ReactNode, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

type INavbarProps = {
  logo: ReactNode;
  children: ReactNode;
  noTheme?: boolean;
  theme: string;
};

export default function NavbarTwoColumns(props: INavbarProps) {
  const [path, setPath] = useState('');
  const router = useRouter();

  useEffect(() => {
    setPath(router.pathname);
  }, []);
  return (
    <div className="flex flex-wrap justify-between items-center">
      <div className="flex items-center text-white z-10">
        <Link href="/">
          <a>{props.logo}</a>
        </Link>
        <Link href="https://app.creaton.io/#/creators">
          <a
            className={`ml-10 font-bold text-sm ${
              props.noTheme || props.theme === 'dark' ? 'text-white' : 'text-indigo-900'
            } ${path === 'https://app.creaton.io/#/creators' ? 'active relative' : ''}`}
          >
            Creators
          </a>
        </Link>
        <Link href="/partner">
          <a
            className={`mx-5 font-bold text-sm ${
              props.noTheme || props.theme === 'dark' ? 'text-white' : 'text-indigo-900'
            } ${path === '/partner' ? 'active relative' : ''}`}
          >
            Partners
          </a>
        </Link>
      </div>

      <nav>
        <ul className="navbar flex items-center font-medium text-xl text-gray-800">{props.children}</ul>
      </nav>
    </div>
  );
}

export {NavbarTwoColumns};
