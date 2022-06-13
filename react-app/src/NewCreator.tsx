import React from "react";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { BrowserRouter } from "react-router-dom";
import styled from "styled-components";

const StyledContainer = styled.div`
  background-color: #120821;
  width: 100%;
`;
initializeIcons();

function NewCreator() {
  return (
    <BrowserRouter>
      <StyledContainer>
      </StyledContainer>
    </BrowserRouter>
  );
}

export default NewCreator;