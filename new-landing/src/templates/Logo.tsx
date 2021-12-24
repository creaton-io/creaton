import { AppConfig } from '../utils/AppConfig';
import { useRouter } from 'next/router';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const router = useRouter();
  const fontStyle = props.xl
    ? 'font-semibold text-xl'
    : 'font-semibold text-2xl';

  return (
    <span className={`text-white inline-flex items-center ${fontStyle}`}>
      <img src={`${router.basePath}/assets/images/logo.png`} alt={'Logo'} />
      {AppConfig.site_name}
    </span>
  );
};

export { Logo };
