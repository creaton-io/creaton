import React, { ReactNode } from 'react';

import { Meta } from './Meta';
import { AppConfig } from '../utils/AppConfig';
import { Footer } from '../templates/Footer';
import Header from './header'
import Banner from './banner'
import { Button } from '../components/button/Button';

type Props = {
    children: ReactNode;
    theme: string;
};

export default function Layout(props: Props) {
    return (
        <>
            <Header theme={props.theme} />
            <div className='content-wrapper min-h-screen'>
                <Banner />
                <main className='w-1/2'>
                    <div className="antialiased text-gray-600 h-full">
                        <Meta title={AppConfig.title} description={AppConfig.description} />
                        <div className='w-full flex items-center h-full'>
                            <div className='max-w-md mx-auto w-full flex flex-col justify-between items-end h-screen overflow-y-scroll partner-container'>
                                <Button link="/signupCreator" title="Sign up as creator now!" />
                                {props.children}
                                <Footer />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
