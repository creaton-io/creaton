import {Pivot, PivotItem} from '@fluentui/react';
import * as React from 'react';
import styled from 'styled-components';
import BrowseByCategoryCard from './BrowseByCategoryCard/BrowseByCategoryCard';
import bottomImage from '../../../assets/png/Ellipse167.png';
import topImage from '../../../assets/png/Rectangle51.png';
import {carouselResponsiveRange, StyledCarousel} from '../../../common/styles';
import Carousel from 'react-multi-carousel';

const StyledContainer = styled.div`
  text-align: center;
  color: #fff;
  margin-top: 80px;
`;

const StyledText = styled.div`
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 30px;
`;

const BrowseByCategory = () => {
  return (
    <StyledContainer>
      <StyledText>Browse by category</StyledText>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '50px',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '15px',
        }}
      >
        <Pivot
          linkFormat="tabs"
          styles={{
            link: {
              fontFamily: 'Avenir !important',
              border: '1px solid #be97ff',
              height: '30px',
              borderRadius: '14px',
              color: '#fff',
              ':hover': {
                color: '#120821 !important',
                backgroundColor: '#2DC178 !important',
              },
            },
            linkIsSelected: {
              color: '#120821 !important',
              backgroundColor: '#2DC178 !important',
            },
            root: {
              display: 'flex',
              gap: '16px',
            },
          }}
        >
          <PivotItem headerText="Art" />
          <PivotItem headerText="Utility" />
          <PivotItem headerText="Tutorials" />
          <PivotItem headerText="Augmented Reality" />
          <PivotItem headerText="Music" />
        </Pivot>
      </div>
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
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
          <BrowseByCategoryCard
            topImage={topImage}
            bottomImage={bottomImage}
            bottomText={'5,000 Snapshots passes in the Solana metaverse'}
            topText={'Snapshots by ZvK'}
            author={'Sorbs'}
          />
        </Carousel>
      </StyledCarousel>
    </StyledContainer>
  );
};

export default BrowseByCategory;
