import * as React from "react";
import styled from "styled-components";
import BrowseByCategory from "./BrowseByCategory/BrowseByCategory";
import CreateSellContent from "./CreateSellContent/CreateSellContent";
import LinksSection from "./LinksSection/LinksSection";
import Main from "./Main/Main";
import NotableCreators from "./NotableCreators/NotableCreators";
import PartneredWith from "./PartneredWith/PartneredWith";
import ReadyContent from "./ReadyContent/ReadyContent";
import TokenScale from "./TokenScale/TokenScale";

const StyledContainer = styled.div`
  padding: 5% 5% 15% 5%;
`;

export const Home = () => {
  return (
    <StyledContainer>
      <Main />
      <PartneredWith />
      <TokenScale />
      <NotableCreators />
      <CreateSellContent />
      <BrowseByCategory />
      <ReadyContent />
      <LinksSection />
    </StyledContainer>
  );
};

export default Home;
