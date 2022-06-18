import styled from "styled-components";

export const StyledCarousel = styled.div`
  .carousel-container {
    width: 100%;
  }
  .react-multiple-carousel__arrow--left {
    left: 0;
  }

  .react-multiple-carousel__arrow--right {
    right: 0;
  }

  .react-multiple-carousel__arrow {
    background: #42375a;
  }

  .react-multi-carousel-dot-list {
    bottom: auto;
  }

  .react-multi-carousel-dot--active button {
    background: #43e296 !important;
  }

  .react-multi-carousel-dot button {
    border-radius: 0;
    background: #42375a;
    border: 0;
    width: 8px;
    height: 8px;
  }
`;

export const carouselResponsiveRange = {
  desktop: {
    breakpoint: { max: 3000, min: 1001 },
    items: 3,
    slidesToSlide: 1, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1001, min: 769 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 768, min: 320 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};
