import {useRouter} from 'next/router';

type IItemProps = {
  key: number;
  image: string;
  description: string;
};

const PartnerItem = (props: IItemProps) => {
  const router = useRouter();
  return (
    <div className="my-8">
      <img src={`${router.basePath}${props.image}`} className="my-4" alt={'Partner Image'} />
      <p className="text-gray-700 text-sm my-4">{props.description}</p>
    </div>
  );
};

export {PartnerItem};
