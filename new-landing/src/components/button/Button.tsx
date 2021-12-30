import Link from 'next/link';
import { ReactNode } from 'react';

type IButtonProps = {
  link: string;
  title: string;
  class?: string;
  icon?: ReactNode;
};

const Button = (props: IButtonProps) => {
  return (
    <Link href={`${props.link}`}>
      <a className={`flex items-center w-fit bg-green-400 rounded-md px-3 py-2 text-indigo-900 text-sm font-bold my-3 ${props.class}`}>
        {props.title}&nbsp;
        {props.icon ? props.icon : ''}
      </a>
    </Link>
  );
};

export { Button };
