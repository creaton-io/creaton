import * as React from "react";
import {
  StyledAuthor,
  StyledBottomImage,
  StyledBottomText,
  StyledContainer,
  StyledTitle,
  StyledTopImage,
} from "./BrowseByCategoryCard.styles";
import { Link } from "@fluentui/react";

interface CreatorCardProps {
  topImage: string;
  bottomImage: string;
  bottomText: string;
  topText: string;
  author: string;
}

const BrowseByCategoryCard = ({
  bottomImage,
  topImage,
  bottomText,
  topText,
  author,
}: CreatorCardProps) => {
  return (
    <StyledContainer>
      <StyledTopImage src={topImage} height={"50%"} />
      <StyledBottomImage src={bottomImage} width={72} height={72} />
      <StyledTitle>{topText}</StyledTitle>
      <StyledAuthor>
        by{" "}
        <Link
          styles={{
            root: { color: "#659AE2", fontFamily: "Avenir !important" },
          }}
        >
          {author}
        </Link>
      </StyledAuthor>
      <StyledBottomText>{bottomText}</StyledBottomText>
    </StyledContainer>
  );
};

export default BrowseByCategoryCard;
