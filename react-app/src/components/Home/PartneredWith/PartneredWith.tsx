import * as React from "react";
import styled from "styled-components";
import partner1 from "../../../assets/png/Partner1.png";
import partner2 from "../../../assets/png/Partner2.png";
import partner3 from "../../../assets/png/Partner3.png";
import partner4 from "../../../assets/png/Partner4.png";
import partner5 from "../../../assets/png/Partner5.png";
import partner6 from "../../../assets/png/Partner6.png";
import breakpoint from "../../../common/breakpoint";

const StyledContainer = styled.div`
  text-align: center;
  font-weight: 800;
  font-size: 32px;
  color: #fff;
  margin-top: 50px;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  padding-top: 20px;
  align-items: center;
  grid-column-gap: 3%;
  grid-row-gap: 10%;

  @media only screen and ${breakpoint.device.xs} {
    grid-template-columns: 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.sm} {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.lg} {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
`;

export const PartneredWith = () => {
  return (
    <StyledContainer>
      <div>Partnered with</div>
      <StyledGrid>
        <img src={partner1} />
        <img src={partner2} />
        <img src={partner3} />
        <img src={partner4} />
        <img src={partner5} />
        <img src={partner6} />
      </StyledGrid>
    </StyledContainer>
  );
};

export default PartneredWith;
