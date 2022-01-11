import Link from 'next/link';
import Layout from '../layout/Layout';
import {Button} from '../components/button/Button';

type IndexProps = {
  theme: string;
};

export default function Index(props: IndexProps) {
  return (
    <Layout theme={props.theme}>
      <div className="flex flex-col">
        <h2 className="text-indigo-900 text-2xl font-bold mb-2">Connect Directly</h2>
        <p className="text-gray-500 text-sm opacity-90">Engage Fans, Build an Unstoppable Income</p>
        <p className="text-indigo-900 text-base font-bold mt-5 mb-3">Web3 Membership Platform that gives you:</p>
        <p className="text-gray-500 text-sm opacity-90 mb-6">
          Subscription income from fans in real-time Ownership of your content - With NFT's Permanent storage - Content
          is forever available Super low fees - No middlemen
        </p>
        <Button link="/signupCreator" title="Sign up as creator now!"  theme="purple" />
        <Link href="/">
          <a className="w-fit p-3 text-indigo-900 text-sm font-bold">Learn More -&gt;</a>
        </Link>
      </div>
    </Layout>
  );
}

export {Index};
