import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Switch from "react-switch";

import { Background } from '../components/background/Background';
import { NavbarTwoColumns } from '../components/navigation/NavbarTwoColumns';
import { Logo } from '../templates/Logo';
import { Button } from '../components/button/Button';
import { FaArrowUp } from "react-icons/fa";

type Props = {
	handleSwitch: Function;
	theme: string;
};

export default function MainHeader(props: Props) {
	const [themeChecked, setThemeChecked] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const router = useRouter();
	const items = [
		{
			data: '2900 USDCx',
			icon: 'usdc.png',
			tip: true,
		},
		{
			data: '2900 USDC',
			icon: 'usdc.png',
			tip: false,
		},
		{
			data: '10 MATIC',
			icon: 'matic.png',
			tip: false,
		}
	];

	const handleThemeChange = (checked: boolean) => {
		setThemeChecked(checked);
		props.handleSwitch();
	}

	const toggling = () => setIsOpen(!isOpen);

	return (
		<Background color="bg-transparent w-full">
			<div className="container flex justify-between py-2 mx-auto">
				<NavbarTwoColumns theme={props.theme} logo={<Logo theme={props.theme} xl />}>
				</NavbarTwoColumns>
				<div className='flex items-center'>
					<div className='max-w-md mx-auto flex items-center partner-container'>
						<Link href="/subscribers">
							<a className={`ml-5 font-bold text-sm ${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} ${router.pathname === '/subscribers' ? 'active relative' : ''}`}>Subscribers</a>
						</Link>
						<Button link='/upload' title='Upload' class='mx-5' icon={<FaArrowUp />} />
						<div className='flex flex-col items-end relative'>
							<div className='flex w-fit my-2 address-wrapper rounded-full p-1.5 items-center cursor-pointer' onClick={toggling}>
								<p className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xs px-2 font-bold`}>0x89021...28931</p>
								<img src={`${router.basePath}/assets/images/avatar.png`} alt={'Avatar'} />
							</div>
							{
								isOpen &&
								<div className={`${props.theme === 'dark' ? 'bg-main-100' : 'bg-white'} rounded-lg w-52 border-gray-400 border-solid border px-3 py-3 absolute top-14 z-10`}>
									{
										items.map((item, index) => (
											<div key={index} className='flex py-1.5 cursor-pointer'>
												<img className='w-10 h-10' src={`${router.basePath}/assets/images/${item.icon}`} alt={'Icon'} />
												<div className='flex flex-col pl-2'>
													<span className='text-gray-500 text-sm'>Balance</span>
													<span className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-sm font-bold`}>{item.data}</span>
												</div>
											</div>
										))
									}
									<div className='flex justify-between pt-2 border-t border-solid border-gray-400 mt-1.5'>
										<span className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>Theme</span>
										<Switch onChange={handleThemeChange} checked={themeChecked} onColor='#312880' offColor='#F6F5FD' onHandleColor='#FFFFFF' offHandleColor='#6A6781' width={50} height={26} checkedIcon={false} uncheckedIcon={false} />
									</div>
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		</Background>
	);
}

export { MainHeader };
