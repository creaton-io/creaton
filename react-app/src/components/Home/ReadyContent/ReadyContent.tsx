import * as React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
  text-align: center;
  color: #fff;
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledText = styled.div`
  font-size: 46px;
  font-weight: 500;
`;

export const GetStartedButton = styled.div`
  padding: 10px;
  background-color: #35cc82;
  border-radius: 8px;
  text-align: center;
  color: #271940;
  margin-top: 30px;
  width: 150px;
  font-weight: 800;
  font-size: 16px;
`;

const ReadyContent = () => {
  return (
    <StyledContainer>
      <StyledText>Ready to own your content?</StyledText>
      <GetStartedButton>Get Started</GetStartedButton>
    </StyledContainer>
  );
};

export default ReadyContent;
