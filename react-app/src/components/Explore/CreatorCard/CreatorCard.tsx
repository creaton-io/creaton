import * as React from "react";
import {
  BottomContainer,
  BottomText,
  CountContainer,
  PriceContainer,
  StyledBottomImage,
  StyledContainer,
  StyledTitle,
  StyledTopImage,
} from "./CreatorCard.styles";
import icon from "../../../assets/png/Group_714.png";

interface CreatorCardProps {
  topImage: string;
  bottomImage: string;
  title: string;
  count: string;
  price: string;
}

const CreatorCard = ({
  bottomImage,
  count,
  price,
  title,
  topImage,
}: CreatorCardProps) => {
  return (
    <StyledContainer>
      <StyledTopImage src={topImage} width={"95%"} height={"50%"} />
      <StyledBottomImage src={bottomImage} width={72} height={72} />
      <StyledTitle>{title}</StyledTitle>
      <BottomContainer>
        <CountContainer>
          <img src={icon} width={20} height={20} alt={"count"} />
          <div>{count}</div>
        </CountContainer>
        <PriceContainer>
          <BottomText>{price}</BottomText>
        </PriceContainer>
      </BottomContainer>
    </StyledContainer>
  );
};

export default CreatorCard;
