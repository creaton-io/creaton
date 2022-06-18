import * as React from "react";
import styled from "styled-components";
import backgroundImage from "../../../assets/png/Group736.png";
import icon from "../../../assets/png/icon.png";
import icon3 from "../../../assets/png/Group735.png";
const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 60px;
  justify-content: space-between;
  position: relative;
  bottom: 90px;
`;

const TokenScale = () => {
  return (
    <div style={{ marginTop: "100px" }}>
      <img src={backgroundImage} style={{ minHeight: "115px" }} />
      <StyledContainer>
        <img src={icon3} style={{ cursor: "pointer" }} />
        <img src={icon} />
      </StyledContainer>
    </div>
  );
};

export default TokenScale;
