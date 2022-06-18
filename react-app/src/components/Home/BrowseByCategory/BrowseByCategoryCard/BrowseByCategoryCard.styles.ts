import styled from "styled-components";

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #46385a;
  border: 0.2px solid #46385a;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  max-width: 75%;
  margin-right: auto;
  margin-left: auto;
`;

export const StyledTopImage = styled.img`
  align-self: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export const StyledBottomImage = styled.img`
  position: relative;
  bottom: 37px;
  left: 38%;
`;

export const StyledTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  position: relative;
  bottom: 32px;
`;

export const StyledAuthor = styled(StyledTitle)`
  font-size: 15px;
  font-weight: 500;
`;

export const StyledBottomText = styled(StyledAuthor)`
  font-size: 16px;
  color: #757575;
  line-height: 22px;
  display: flex;
  align-self: center;
  width: 70%;
  bottom: 24px;
`;
