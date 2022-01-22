import React, {ReactNode} from 'react';

import {Meta} from './Meta';
import {AppConfig} from '../utils/AppConfig';
import {Footer} from '../templates/Footer';
import Header from './header';
import Banner from './banner';

type Props = {
  children: ReactNode;
  theme: string;
};

export default function Layout(props: Props) {
  return (
    <>
      <Header theme={props.theme} />
      <div className="content-wrapper min-h-screen">
        <Banner />
        <main className="w-1/2">
          <div className="antialiased text-gray-600 h-full">
            <Meta title={AppConfig.title} description={AppConfig.description} />
            <div className="w-full flex items-center h-full">
              <div className="max-w-md mx-auto w-full flex flex-col py-6 justify-between items-end h-screen overflow-y-scroll partner-container">
                <a href="https://app.creaton.io">
                  <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden shadow-lg shadow-green-500/50 text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-emerald-500 group-hover:from-purple-600 group-hover:to-emerald-500 hover:text-white dark:text-white focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white font-medium text-black group-hover:text-white rounded-md group-hover:bg-opacity-0">
                      Go To App
                    </span>
                  </button>
                </a>
                {props.children}
                <Footer />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
