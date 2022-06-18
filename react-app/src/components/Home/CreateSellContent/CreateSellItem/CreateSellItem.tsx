import * as React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
  text-align: center;
  color: #fff;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTopText = styled.div`
  font-size: 18px;
  font-weight: 900;
  padding: 15px 0;
`;

const StyledBottomText = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

interface CreateSellItemProps {
  img: string;
  topText: string;
  bottomText: string;
}

const CreateSellItem = ({ img, topText, bottomText }: CreateSellItemProps) => {
  return (
    <StyledContainer>
      <img src={img} />
      <StyledTopText>{topText}</StyledTopText>
      <StyledBottomText>{bottomText}</StyledBottomText>
    </StyledContainer>
  );
};

export default CreateSellItem;
