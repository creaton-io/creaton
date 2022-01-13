import type {ReactElement, ReactNode} from 'react';
import React, {useState} from 'react';
import type {NextPage} from 'next';
import type {AppProps} from 'next/app';

import '../styles/main.css';
import '../styles/custom.css';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({Component, pageProps}: AppPropsWithLayout) {
  const [theme, setTheme] = useState('light');
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  const handleSwitch = () => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  return getLayout(<Component {...pageProps} theme={theme} handleSwitch={handleSwitch} />);
}
