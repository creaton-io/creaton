import Link from 'next/link';
import Layout from '../layout/Layout';
import { Button } from '../components/button/Button';
import { PartnerItem } from '../components/partner/Item';

type IndexProps = {
	theme: string;
};

export default function Partner(props: IndexProps) {
    const items = [
        {
            image: '/assets/images/partnerImage1.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        },
        {
            image: '/assets/images/partnerImage3.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        },
        {
            image: '/assets/images/partnerImage2.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        },
        {
            image: '/assets/images/partnerImage4.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        },
        {
            image: '/assets/images/partnerImage5.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        },
        {
            image: '/assets/images/partnerImage6.png',
            descrition: 'But I must explain to you how all this mistaken idea of denouncing pleasure when to lock'
        }
    ];

    return (
        <Layout theme={props.theme}>
            <div>
                <Link href='/'>
                    <a className='w-fit text-indigo-900 text-sm font-bold'>
                        &lt;- Back
                    </a>
                </Link>
                <h2 className='text-indigo-900 text-2xl font-bold mb-2 mt-4'>
                    Partners
                </h2>
                <p className='text-gray-500 text-sm opacity-90 mb-6'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                </p>
                <Button link='/' title='Want to join as partner?' class='mt-8 mb-4' />
                {
                    items.map((item, index) => (
                        <PartnerItem key={index} image={item.image} description={item.descrition} />
                    ))
                }
            </div>
        </Layout>
    )
}

export { Partner };

