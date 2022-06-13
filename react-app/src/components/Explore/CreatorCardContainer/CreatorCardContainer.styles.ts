import styled from "styled-components";
import breakpoint from "../../../common/breakpoint";

export const StyledContainer = styled.div`
  display: grid;
  grid-row-gap: 30px;
  grid-column-gap: 30px;

  @media only screen and ${breakpoint.device.xs} {
    grid-template-columns: 1fr;
  }
  @media only screen and ${breakpoint.device.sm} {
    grid-template-columns: 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.lg} {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;
