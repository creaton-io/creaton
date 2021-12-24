import Link from 'next/link';

type IButtonProps = {
  link: string;
  title: string;
  class?: string;
};

const Button = (props: IButtonProps) => {
  return (
    <Link href={`${props.link}`}>
      <a className={`w-fit bg-green-400 rounded-md px-3 py-2 text-indigo-900 text-sm font-bold my-3 ${props.class}`}>
        {props.title}
      </a>
    </Link>
  );
};

export { Button };
