import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { Input } from '../components/input/Input';
import { Button } from '../components/button/Button';

type IndexProps = {
	handleSwitch: Function;
	theme: string;
};

export default function Index(props: IndexProps) {
	const router = useRouter();
	const inputFile = useRef<HTMLInputElement>(null);

	const onShowFileSelector = () => {
		inputFile.current?.click();
	};

	return (
		<MainLayout theme={props.theme} handleSwitch={props.handleSwitch}>
			<div className='container flex flex-col mx-auto w-full max-w-2xl'>
				<h1 className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xl font-bold pt-12 pb-2 text-center`}>Upload item</h1>
				<p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm text-center`}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit
				</p>
				<div>
					<h2 className={`flex ${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} font-bold text-sm my-3 items-center`}>
						Title
					</h2>
					<input type='text' className={`w-full rounded ${props.theme === 'dark' ? 'text-white bg-transparent border-border-200' : 'text-indigo-900'} border-gray-400 border-solid border px-3 py-2`} placeholder='Title' />
				</div>
				<div>
					<h2 className={`flex ${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} font-bold text-sm my-3 items-center`}>
						Description
					</h2>
					<textarea className={`w-full rounded ${props.theme === 'dark' ? 'text-white bg-transparent border-border-200' : 'text-indigo-900'} border-gray-400 border-solid border px-3 py-2`} rows={10}>
					</textarea>
				</div>
				<input type='file' id='file' ref={inputFile} style={{ display: 'none' }} />
				<div className={`rounded-lg border border-solid ${props.theme === 'dark' ? 'text-white bg-transparent border-white' : 'text-indigo-900 border-indigo-900'} w-fit p-2 font-bold mt-3 cursor-pointer`} onClick={onShowFileSelector}>Attach a file</div>
				<Button link='/' title='Upload' class='mt-8' />
			</div>
		</MainLayout>
	)
}

export { Index };

