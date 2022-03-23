import {Link} from 'react-router-dom';
import {useCurrentCreator} from '../Utils';

const CreatorHome = () => {
  const {currentCreator} = useCurrentCreator();
  if (currentCreator) {
    return (
      <Link
        to={'/creator/' + currentCreator.creatorContract}
        className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 m-auto hover-tab p-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    );
  } else
    return (
      <Link
        to="/subscribers/"
        className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 m-auto hover-tab p-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    );
};

export default CreatorHome;
