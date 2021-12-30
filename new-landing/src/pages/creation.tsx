import { useRouter } from 'next/router';
import MainLayout from '../layout/MainLayout';
import { Button } from '../components/button/Button';
import { FaEye } from "react-icons/fa";

type IndexProps = {
    handleSwitch: Function;
    theme: string;
};

export default function Index(props: IndexProps) {
    const router = useRouter();

    return (
        <MainLayout theme={props.theme} handleSwitch={props.handleSwitch}>
            <div className='w-screen max-w-screen relative'>
                {
                    props.theme === 'light' ? (
                        <img src={`${router.basePath}/assets/images/lightCreationBg.png`} className='w-screen max-w-screen' alt={'Creation Background'} />
                    ) : (
                        <img src={`${router.basePath}/assets/images/darkCreationBg.png`} className='w-screen max-w-screen' alt={'Creation Background'} />
                    )
                }
                <img src={`${router.basePath}/assets/images/creator1.png`} className='rounded-full border-2 border-white border-solid absolute h-14 -bottom-7 left-half' alt={'Creation Icon'} />
            </div>
            <div className='container flex flex-col items-center mx-auto'>
                <h1 className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xl font-bold pt-12 pb-2`}>Creation</h1>
                <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>
                    The Official Creaton Creaton account!
                </p>
                <Button link='/' title='Start $1 subscription' class='mt-8 mb-4' />
                <h1 className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-lg font-bold pt- 2 pb-2`}>Latest posts</h1>
                <div className={`${props.theme === 'dark' ? 'border-border-200' : 'border-border-100'} rounded-lg border border-solid p-4 w-full max-w-2xl`}>
                    <div className={`rounded p-8 flex justify-center items-center ${props.theme === 'dark' ? 'bg-white-opacity' : 'bg-gray-100'}`}>
                        <img src={`${router.basePath}/assets/images/logo.png`} alt={'Creation Logo'} />
                    </div>
                    <div className='flex justify-between py-2'>
                        <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>22.10.2021, 23:06:00</p>
                        <FaEye className='w-5' fill={`${props.theme === 'dark' ? '#FFFFFF' : '#312880'}`} />
                    </div>
                    <p className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-lg font-bold`}>Aaaaaand we're live!</p>
                    <p className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>Finally</p>
                </div>
            </div>
        </MainLayout>
    )
}

export { Index };

