import styled from "styled-components";
import breakpoint from "../../common/breakpoint";

export const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 2%;
  padding-right: 2%;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 70%;
  gap: 6%;
  margin-left: 10%;

  @media only screen and ${breakpoint.device.xs} {
    display: none;
  }
  @media only screen and ${breakpoint.device.sm} {
    display: flex;
  }
  @media only screen and ${breakpoint.device.lg} {
    display: flex;
  }
`;

export const SignUpButton = styled.div`
  padding: 10px;
  background-color: #35cc82;
  border-radius: 8px;
  text-align: center;

  @media only screen and ${breakpoint.device.xs} {
    display: none;
  }
  @media only screen and ${breakpoint.device.sm} {
    display: flex;
  }
  @media only screen and ${breakpoint.device.lg} {
    display: flex;
  }
`;

export const StyledFontIcon = styled.div`
  @media only screen and ${breakpoint.device.xs} {
    display: inherit;
  }
  @media only screen and ${breakpoint.device.sm} {
    display: none;
  }
  @media only screen and ${breakpoint.device.lg} {
    display: none;
  }
`;

export const StyledLink = styled.div`
  color: #fff;
  font-size: 16px;
  font-weight: 800;
`;
