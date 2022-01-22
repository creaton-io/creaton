import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {SliderItem} from '../components/slider/item';

export default function Banner() {
  const items = [
    {
      title: 'Take Ownership',
      description: 'Upload images, videos, blogs & audio all owned by you through the power of Web3',
      image: '/assets/images/homeSlider1.png',
      buttonTitle: 'Start Creating',
      buttonLink: 'https://app.creaton.io',
    },
    {
      title: 'Join our Discord',
      description: 'Join our community, help build a more equitable internet & creator economy and get rewarded!',
      image: '/assets/images/homeSlider2.png',
      buttonTitle: 'Join Discord',
      buttonLink: 'https://discord.gg/krSNH2SghC',
    },

    {
      title: 'Discover new Creators',
      description: 'Support the creatives who are creating Podcasts, Music, Vlogs & Metaverse Content on Web3!',
      image: '/assets/images/homeSlider4.png',
      buttonTitle: 'Discover',
      buttonLink: 'https://creaton.io/#/creators',
    },
    {
      title: 'Meet our Partners',
      description: 'The people behind the Technologies enabling a Better Digital Future',
      image: '/assets/images/homeSlider3.png',
      buttonTitle: 'Partners',
      buttonLink: '/partner',
    },
  ];
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className="w-1/2 slider-container p-5 slider-container flex justify-center items-center">
      <div className="m-0 m-auto">
        <Slider {...settings} className="w-full">
          {items.map((item, index) => (
            <SliderItem
              key={index}
              title={item.title}
              description={item.description}
              image={item.image}
              buttonTitle={item.buttonTitle}
              buttonLink={item.buttonLink}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
}

export {Banner};
