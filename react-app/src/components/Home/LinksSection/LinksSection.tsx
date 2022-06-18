import * as React from "react";
import styled from "styled-components";
import line from "../../../assets/png/Vector25.png";
import breakpoint from "../../../common/breakpoint";
const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #fff;
  margin-top: 80px;
  justify-items: center;
`;

const StyledInnerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: column;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-column-gap: 150px;

  @media only screen and ${breakpoint.device.xs} {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.sm} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.lg} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }
`;

const StyledHeading = styled.div`
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 30px;
`;

const StyledLink = styled.div`
  font-weight: 400;
  font-size: 16px;
  margin-bottom: 30px;
  border-bottom: 1px solid;

  border-image-source: conic-gradient(
    from 180deg at 50% 50%,
    #c7248f 0deg,
    #c2dc78 138.75deg,
    #d62dbb 181.64deg,
    #b1b4eb 223.13deg,
    #3ee9d4 305.63deg,
    #c7248f 360deg
  );
`;

const LinksSection = () => {
  return (
    <StyledContainer>
      <div>
        <StyledHeading>MarketPlace</StyledHeading>
        <StyledInnerContainer>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>All NFTs</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Art</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Collectibles</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}> Music</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Photography</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Sports</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Virtual Worlds</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Utility</div>
            <img src={line} />
          </StyledLink>
        </StyledInnerContainer>
      </div>
      <div>
        <StyledHeading>My Account</StyledHeading>
        <StyledInnerContainer>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Profile</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Favorites</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Watchlist</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>My Collections</div>
            <img src={line} />
          </StyledLink>
          <StyledLink>
            <div style={{ paddingBottom: 15 }}>Settings</div>
            <img src={line} />
          </StyledLink>
        </StyledInnerContainer>
      </div>
    </StyledContainer>
  );
};

export default LinksSection;
