import {Icon} from "../icons";
import clsx from 'clsx';

export const Avatar = ({src = '', size = 'large'}: any) => {
  const size_classes = {
    'large': 'w-32 h-32',
    'profile': 'w-20 h-20',
    'menu':'h-12 w-12 -mt-2',
    'medium':'h-12 w-12 -mt-2',
    'small': 'w-8 h-8'
  }
  if (!src)
    return (
      <span>
      <div className={clsx(size_classes[size], "rounded-full border-dotted bg-gray-100 text-center m-auto")}>
        <svg xmlns="http://www.w3.org/2000/svg"  className="m-auto text-gray-400 w-3/4 h-full" fill="none" viewBox="0 0 24 24" stroke="blue">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      </span>
    )
  else
    return (
      <img className={clsx(size_classes[size], "rounded-full", "border-2", "border-blue-primary", "object-cover")} src={src} alt="profile avatar"/>
    );
}
