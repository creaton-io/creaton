import Link from 'next/link';
import Layout from '../layout/Layout';
import {Button} from '../components/button/Button';
import {PartnerItem} from '../components/partner/Item';

type IndexProps = {
  theme: string;
};

export default function Partner(props: IndexProps) {
  const items = [
    {
      image: '/assets/images/partnerImage1.png',
      descrition: 'Polygon is an Ethereum sidechain providing fast & cheap transaction fees',
    },
    {
      image: '/assets/images/partnerImage3.png',
      descrition: 'Superfluid enables subscriptions on the blockchain by streaming tokens in real-time instead of paying once a month',
    },
    {
      image: '/assets/images/partnerImage2.png',
      descrition: 'Lit Protocol encrypts & decrypts content in a trustless manner',
    },
    {
      image: '/assets/images/partnerImage4.png',
      descrition: 'NuCypher (soon Threshold Network) provides privacy to the blockchain',
    },
    {
      image: '/assets/images/partnerImage5.png',
      descrition: 'The Graph is a decentralized indexer of blockchain data to query data on the website',
    },
    {
      image: '/assets/images/partnerImage6.png',
      descrition: 'Arweave is a decentralized storage network where your data is stored on, most NFTs are stored on centralized servers!',
    },
  ];

  return (
    <Layout theme={props.theme}>
      <div>
        <Link href="/">
          <a className="w-fit text-indigo-900 text-sm font-bold">&lt;- Back</a>
        </Link>
        <h2 className="text-indigo-900 text-2xl font-bold mb-2 mt-4">Partners</h2>
        <p className="text-gray-500 text-sm opacity-90 mb-6">
          Our partners enabling our platform!
        </p>
        <Button link="/" title="Want to join as partner?" class="mt-8 mb-4" />
        {items.map((item, index) => (
          <PartnerItem key={index} image={item.image} description={item.descrition} />
        ))}
      </div>
    </Layout>
  );
}

export {Partner};
