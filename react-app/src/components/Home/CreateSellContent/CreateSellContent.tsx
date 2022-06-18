import * as React from "react";
import styled from "styled-components";
import CreateSellItem from "./CreateSellItem/CreateSellItem";
import item from "../../../assets/png/Vector.png";
import item2 from "../../../assets/png/Vector2.png";
import item3 from "../../../assets/png/Vector3.png";
import item4 from "../../../assets/png/Vector4.png";
import breakpoint from "../../../common/breakpoint";

const StyledContainer = styled.div`
  text-align: center;
  color: #fff;
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledText = styled.div`
  font-size: 32px;
  font-weight: 900;
`;

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-column-gap: 30px;

  @media only screen and ${breakpoint.device.xs} {
    grid-template-columns: 1fr;
  }
  @media only screen and ${breakpoint.device.sm} {
    grid-template-columns: 1fr 1fr;
  }
  @media only screen and ${breakpoint.device.lg} {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

const CreateSellContent = () => {
  return (
    <StyledContainer>
      <StyledText>Create and sell your content</StyledText>
      <ItemContainer>
        <CreateSellItem
          img={item}
          topText={"Take Ownership"}
          bottomText={
            "Upload images, videos, blogs & audio all owned by you through the power of Web3"
          }
        />
        <CreateSellItem
          img={item2}
          topText={"Protect your content"}
          bottomText={"Our Decentralized Encrypted Storage has your back"}
        />
        <CreateSellItem
          img={item3}
          topText={"Never lose content"}
          bottomText={"Content is available forever with blockchain technology"}
        />
        <CreateSellItem
          img={item4}
          topText={"Avoid Middlemen"}
          bottomText={"Connect directly with your audience"}
        />
      </ItemContainer>
    </StyledContainer>
  );
};

export default CreateSellContent;
