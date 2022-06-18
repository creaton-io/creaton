import * as React from "react";
import styled from "styled-components";
import image from "../../../assets/png/image2.png";
import ellipse from "../../../assets/png/Ellipse14.png";
import breakpoint from "../../../common/breakpoint";

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #fff;
  justify-items: center;
  align-items: center;
  @media only screen and ${breakpoint.device.xs} {
    grid-template-columns: 1fr;
  }
  @media only screen and ${breakpoint.device.sm} {
    grid-template-columns: 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.lg} {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHeading = styled.div`
  font-size: 46px;
  font-weight: 800;
`;

const StyledPurpleSpan = styled.span`
  color: #a160ff;
`;

const StyledTitle = styled.div`
  font-size: 25px;
  font-weight: 400;
  color: #726b7d;
  margin-top: 10px;
  margin-bottom: 40px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const ExploreButton = styled.div`
  padding: 10px 40px;
  background-color: #35cc82;
  border-radius: 8px;
  text-align: center;
  color: #271940;
  cursor: pointer;
`;

const CreateButton = styled.div`
  padding: 10px 40px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  border: 2px solid #35cc82;
`;

const LearnMoreText = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: #2dff99;
`;

const StyledIcon = styled.div`
  border-radius: 50%;
  height: 14px;
  width: 14px;
  border: 4px solid #35cd83;
  background-color: #fff;
`;

const StyledBottomContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
`;

const Main = () => {
  return (
    <StyledContainer>
      <StyledContent>
        <StyledHeading>
          Discover and connect directly with{" "}
          <StyledPurpleSpan>creators</StyledPurpleSpan>
        </StyledHeading>
        <StyledTitle>
          Creaton is the world’s first and largest creator marketplace
        </StyledTitle>
        <StyledButtonContainer>
          <ExploreButton>Explore</ExploreButton>
          <CreateButton>Create</CreateButton>
        </StyledButtonContainer>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "40px",
          }}
        >
          <StyledIcon />
          <LearnMoreText>Learn more about Creaton</LearnMoreText>
        </div>
      </StyledContent>
      <StyledContent>
        <img src={image} style={{ minHeight: "350px" }} />
        <StyledBottomContainer>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={ellipse} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "10px", fontWeight: "800" }}>
                Darrell Steward
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800" }}>
                Phonky Town
              </div>
            </div>
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800" }}>$5/month</div>
        </StyledBottomContainer>
      </StyledContent>
    </StyledContainer>
  );
};

export default Main;
