import Link from 'next/link';
import Layout from '../layout/Layout';
import { Input } from '../components/input/Input';
import { Button } from '../components/button/Button';

type IndexProps = {
	theme: string;
};

export default function SignupCreator(props: IndexProps) {

    return (
        <Layout theme={props.theme}>
            <div className='flex flex-col'>
                <Link href='/'>
                    <a className='w-fit text-indigo-900 text-sm font-bold'>
                        &lt;- Back
                    </a>
                </Link>
                <h2 className='text-indigo-900 text-2xl font-bold mb-2 mt-4'>
                    Sign up as creator
                </h2>
                <p className='text-gray-500 text-sm opacity-90 mb-6'>
                    Setup your creator profile so you can upload content and start earning!
                </p>
                <Input type='text' title='Bio' placeHolder='Artist/Partner/...' />
                <Input type='text' title='Subscription price per month' placeHolder='Price' tip={true} />
                <Input type='text' title='Collection name' placeHolder='My exclusive content' tip={true} />
                <Input type='text' title='Collection Symbol' placeHolder='MYART' tip={true} />
                <Button link='/' title='Become a creator' class='mt-8' />
            </div>
        </Layout>
    )
}

export { SignupCreator };

