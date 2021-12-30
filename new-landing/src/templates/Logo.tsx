import { AppConfig } from '../utils/AppConfig';
import { useRouter } from 'next/router';

type ILogoProps = {
  xl?: boolean;
  noTheme?: boolean;
  theme?: string;
};

const Logo = (props: ILogoProps) => {
  const router = useRouter();
  const fontStyle = props.xl
    ? 'font-semibold text-xl'
    : 'font-semibold text-2xl';

  return (
    <span className={`${props.noTheme || props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} inline-flex items-center ${fontStyle}`}>
      <img src={`${router.basePath}/assets/images/logo.png`} alt={'Logo'} />
      {AppConfig.site_name}
    </span>
  );
};

export { Logo };
