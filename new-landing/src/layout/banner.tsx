import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { SliderItem } from '../components/slider/item';

export default function Banner() {
    const items = [
        {
            title: 'Start Creating',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
            image: '/assets/images/homeSlider1.png',
            buttonTitle: 'Start creating',
            buttonLink: '/',
        },
        {
            title: 'Join our Discord',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
            image: '/assets/images/homeSlider2.png',
            buttonTitle: 'Join to Discord ',
            buttonLink: '/',
        },
        {
            title: 'Meet our partners',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
            image: '/assets/images/homeSlider3.png',
            buttonTitle: 'Partners ',
            buttonLink: '/',
        },
        {
            title: 'Discover new creators',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
            image: '/assets/images/homeSlider4.png',
            buttonTitle: 'Discover ',
            buttonLink: '/',
        },
    ];
    const settings = {
        arrows: false,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };
    return (
        <div className='w-1/2 slider-container p-5 flex items-center'>
            <div>
                <Slider {...settings} className='w-full'>
                    {
                        items.map((item, index) => (
                            <SliderItem key={index} title={item.title} description={item.description} image={item.image} buttonTitle={item.buttonTitle} buttonLink={item.buttonLink} />
                        ))
                    }
                </Slider>
            </div>
        </div>
    );
}

export { Banner };
