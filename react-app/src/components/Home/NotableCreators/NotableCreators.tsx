import * as React from 'react';
import styled from 'styled-components';
import NCreator1 from '../../../assets/png/NCreator1.png';
import NCreator2 from '../../../assets/png/NCreator2.png';
import NCreator3 from '../../../assets/png/NCreator3.png';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {carouselResponsiveRange, StyledCarousel} from '../../../common/styles';

const StyledContainer = styled.div`
  text-align: center;
  font-weight: 800;
  font-size: 32px;
  color: #fff;
  margin-top: 20px;
`;

const ExploreButton = styled.div`
  padding: 10px;
  background-color: #35cc82;
  border-radius: 8px;
  text-align: center;
  color: #271940;
  margin-top: 30px;
  width: 150px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  margin-top: 72px;
`;

export const NotableCreators = () => {
  return (
    <StyledContainer>
      <div style={{marginBottom: '40px'}}>Notable Creators</div>
      <StyledCarousel>
        {/* @ts-ignore */}
        <Carousel
          showDots={true}
          responsive={carouselResponsiveRange}
          infinite={true}
          autoPlay={false}
          keyBoardControl={true}
          customTransition="all .5"
          transitionDuration={500}
          containerClass="carousel-container"
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px"
          shouldResetAutoplay={false}
          renderDotsOutside={true}
        >
          <img src={NCreator1} style={{marginLeft: 'auto', marginRight: 'auto'}} />
          <img src={NCreator2} style={{marginLeft: 'auto', marginRight: 'auto'}} />
          <img src={NCreator3} style={{marginLeft: 'auto', marginRight: 'auto'}} />
          <img src={NCreator2} style={{marginLeft: 'auto', marginRight: 'auto'}} />
          <img src={NCreator1} style={{marginLeft: 'auto', marginRight: 'auto'}} />
          <img src={NCreator3} style={{marginLeft: 'auto', marginRight: 'auto'}} />
        </Carousel>
      </StyledCarousel>
      <ExploreButton>Explore</ExploreButton>
    </StyledContainer>
  );
};

export default NotableCreators;
