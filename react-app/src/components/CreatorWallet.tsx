import {useCurrentCreator} from '../Utils';
import {Link} from 'react-router-dom';

const CreatorWallet = () => {
  const {currentCreator} = useCurrentCreator();
  return (
    <div>
      {currentCreator && (
        <Link
          to={'/creator/' + currentCreator.creatorContract}
          className="bg-gray-50 rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:text-purple-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Open main menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="green">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default CreatorWallet;
