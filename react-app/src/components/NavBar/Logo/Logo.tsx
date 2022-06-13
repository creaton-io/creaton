import * as React from "react";
import styled from "styled-components";
import logo from "../../../assets/png/logo.png";
const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledText = styled.div`
  color: #fff;
  font-size: 20px;
  font-weight: 800;
`;

const Logo = () => {
  return (
    <StyledContainer>
      <img src={logo} alt={"logo"} />
      <StyledText>creaton</StyledText>
    </StyledContainer>
  );
};

export default Logo;
