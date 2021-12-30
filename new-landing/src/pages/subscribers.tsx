import { useRouter } from 'next/router';
import MainLayout from '../layout/MainLayout';

type IndexProps = {
    handleSwitch: Function;
    theme: string;
};

export default function Index(props: IndexProps) {
    const data = [
        {
            title: 'Taqiyuddin amri',
            content: 'Design & illustration Enthusiast',
            image: 'creator8.png'
        },
        {
            title: 'Zhenya Artemjev',
            content: 'Graphic designer & illustrator',
            image: 'creator9.png'
        }
    ];
    const router = useRouter();

    return (
        <MainLayout theme={props.theme} handleSwitch={props.handleSwitch}>
            <div className='container flex flex-col mx-auto'>
                <h1 className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xl font-bold pt-4 pb-2`}>Subscribers</h1>
                <div className='flex justify-between'>
                    <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>
                        These profiles are streaming money to you right now!
                    </p>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3  gap-6 pt-8'>
                    {
                        data.map((item, index) => (
                            <div className={`${props.theme === 'dark' ? 'border-border-200' : 'border-border-100'} rounded-lg border border-solid p-4`}>
                                <img src={`${router.basePath}/assets/images/${item.image}`} alt={'Creator Image'} />
                                <p className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} font-bold py-1`}>{item.title}</p>
                                <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>{item.content}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </MainLayout>
    )
}

export { Index };

