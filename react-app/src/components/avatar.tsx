import {Icon} from "../icons";
import clsx from 'clsx';

export const Avatar = ({src = '', size = 'large'}: any) => {
  const size_classes = {
    'large': 'w-32 h-32',
    'profile': 'w-20 h-20',
    'menu':'h-12 w-12',
    'small': 'w-8 h-8'
  }
  if (!src)
    return (
      <span>
      <p className="text-5xl pt-12 pb-6 text-white">
      Upload Avatar
    </p>
      <div className={clsx(size_classes[size], "rounded-full border-dotted bg-gray-100 text-center m-auto")}>
        <svg xmlns="http://www.w3.org/2000/svg" className="m-auto text-gray-400 w-3/4 h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      </span>
    )
  else
    return (
      <img className={clsx(size_classes[size], "rounded-full", "border-2", "border-blue-primary", "object-cover")} src={src} alt="profile avatar"/>
    );
}
