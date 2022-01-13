import React, { ReactNode } from 'react';

import { Meta } from './Meta';
import { AppConfig } from '../utils/AppConfig';
import MainHeader from './mainHeader'

type Props = {
	children: ReactNode;
	handleSwitch: Function;
	theme: string;
};

export default function MainLayout(props: Props) {
	return (
		<div className={`${props.theme === 'light' ? 'bg-white' : 'bg-main-100'}`}>
			<MainHeader theme={props.theme} handleSwitch={props.handleSwitch} />
			<div className='w-full content-wrapper'>
				<main className='w-full'>
					<div className="antialiased text-gray-600 h-full">
						<Meta title={AppConfig.title} description={AppConfig.description} />
						<div className='w-full items-center h-full'>
							{props.children}
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
