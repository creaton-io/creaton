import { FontIcon } from "@fluentui/react";
import * as React from "react";
import Logo from "../NavBar/Logo/Logo";
import twitter from "../../assets/png/image141.png";
import ico from "../../assets/png/image142.png";
import styled from "styled-components";
import breakpoint from "../../common/breakpoint";

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 2%;
  padding-right: 2%;
  @media only screen and ${breakpoint.device.xs} {
    padding-bottom: 15%;
  }
  @media only screen and ${breakpoint.device.sm} {
    padding-bottom: 5px;
  }
  @media only screen and ${breakpoint.device.lg} {
    padding-bottom: 5px;
  }
`;

const NavBar = () => {
  return (
    <StyledContainer>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={twitter} />
        <img src={ico} />
      </div>
    </StyledContainer>
  );
};

export default NavBar;
