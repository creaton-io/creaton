import { useRef, useState } from 'react';
import Link from 'next/link';
import Layout from '../layout/Layout';
import { Input } from '../components/input/Input';
import { Button } from '../components/button/Button';
import { FaCamera } from "react-icons/fa";

type IndexProps = {
	theme: string;
};

export default function SignupUser(props: IndexProps) {
    const [image, setImage] = useState<any>();
    const inputFile = useRef<HTMLInputElement>(null);

    const onShowFileSelector = () => {
        inputFile.current?.click();
    };

    const handleFileChange = (selectedFile: any) => {
        if (selectedFile) {
            const img = {
                preview: URL.createObjectURL(selectedFile),
                data: selectedFile,
            }
            setImage(img);
        }
    }

    return (
        <Layout theme={props.theme}>
            <div className='flex flex-col'>
                <Link href='/'>
                    <a className='w-fit text-indigo-900 text-sm font-bold'>
                        &lt;- Back
                    </a>
                </Link>
                <h2 className='text-indigo-900 text-2xl font-bold mb-2 mt-4'>
                    Sign up as user
                </h2>
                <p className='text-gray-500 text-sm opacity-90 mb-6'>
                    Setup your user profile so you can upload content and start earning!
                </p>
                <div>
                    <h2 className='flex text-indigo-900 font-bold text-sm my-3 items-center'>
                        Upload avatar
                    </h2>
                    <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} onChange={(e: any) => handleFileChange(e.target.files[0])} />
                    {
                        image ? (
                            <div className='flex justify-center items-center cursor-pointer w-20 h-20 rounded-full border border-solid border-slate-600 bg-cover' style={{ backgroundImage: `url('${image.preview}')` }} onClick={onShowFileSelector}>
                            </div>
                        ) : (
                            <div className='flex justify-center items-center cursor-pointer w-20 h-20 rounded-full border border-solid border-slate-600' onClick={onShowFileSelector}>
                                <FaCamera size='20px' fill='#312880' />
                            </div>
                        )

                    }
                </div>
                <Input type='text' title='Enter your username' placeHolder='Username' />
                <Button link='/' title='Sign up' class='mt-8' />
            </div>
        </Layout>
    )
}

export { SignupUser };

