import {useRouter} from 'next/router';
import {Button} from '../button/Button';

type ItemProps = {
  key: number;
  title: string;
  description: string;
  image: string;
  buttonTitle: string;
  buttonLink: string;
};

export default function SliderItem(props: ItemProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <img src={`${router.basePath}${props.image}`} alt={'slider image'} />
      <h2 className="text-white text-3xl font-bold mt-8 mb-3">{props.title}</h2>
      <p className="text-white opacity-80 text-base text-center">{props.description}</p>
      <Button link={`${props.buttonLink}`} title={props.buttonTitle} />
    </div>
  );
}

export {SliderItem};
