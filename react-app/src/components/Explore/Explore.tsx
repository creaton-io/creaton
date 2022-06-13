import * as React from "react";
import CreatorCardContainer from "./CreatorCardContainer/CreatorCardContainer";
import { StyledContainer, StyledTitle } from "./Explore.styles";

const Explore = () => {
  return (
    <StyledContainer>
      <StyledTitle>Explore Creators</StyledTitle>
      <CreatorCardContainer />
    </StyledContainer>
  );
};

export default Explore;