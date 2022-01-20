import Link from 'next/link';
import Layout from '../layout/Layout';
import {Button} from '../components/button/Button';

type IndexProps = {
  theme: string;
};

export default function Index(props: IndexProps) {
  return (
    <Layout theme={props.theme}>
      <div className="flex flex-col m-0 m-auto">
        <h2 className="text-indigo-900 text-3xl font-bold">Connect Directly</h2>
        <p className="text-gray-600 text-base">Engage Fans, Build an Unstoppable Income</p>
        <p className="text-indigo-900 text-lg font-bold mt-5 mb-3">Web3 Membership Platform that gives you:</p>
        <p className="max-w-md mb-6 text-gray-800 font-semibold leading-loose">
          🌊 Subscription income from fans in real-time <br />
          🗝️ Ownership of your content - With NFT's <br />
          🌐 Decentralized Encrypted Storage <br />
          ♾️ Content is forever available <br />
          💲 No middlemen - Low fees <br />
        </p>
        <Link href="https://creaton.notion.site/Creaton-Docs-a895abf85eee4d9292b626c01c5c2a78">
          <a className="w-fit p-3 text-indigo-900 text-sm font-bold">Learn More -&gt;</a>
        </Link>
      </div>
    </Layout>
  );
}

export {Index};
