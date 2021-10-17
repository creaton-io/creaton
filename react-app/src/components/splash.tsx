import {Player} from '@lottiefiles/react-lottie-player';

export const Splash = ({src = ''}: any) => {
  return (
    <Player autoplay={true} loop={true} controls={true} src={src} style={{height: '300px', width: '300px'}}></Player>
  );
};
