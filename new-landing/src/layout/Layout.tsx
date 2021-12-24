import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';

import { Meta } from './Meta';
import { AppConfig } from '../utils/AppConfig';
import { Footer } from '../templates/Footer';
import Header from './header'
import Banner from './banner'

type Props = {
    children: ReactNode;
};

export default function Layout({ children }: Props) {
    const router = useRouter();
    return (
        <>
            <Header />
            <div className='content-wrapper min-h-screen'>
                <Banner />
                <main>
                    <div className="antialiased text-gray-600 h-full">
                        <Meta title={AppConfig.title} description={AppConfig.description} />
                        <div className='w-full flex items-center h-full'>
                            <div className='max-w-md mx-auto w-full flex flex-col justify-between items-end h-screen overflow-y-scroll partner-container'>
                                <div className='flex w-fit my-6 address-wrapper rounded-full p-1.5 items-center'>
                                    <p className='text-indigo-900 text-xs px-2 font-bold'>0x89021...28931</p>
                                    <img src={`${router.basePath}/assets/images/avatar.png`} alt={'Avatar'} />
                                </div>
                                {children}
                                <Footer />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}