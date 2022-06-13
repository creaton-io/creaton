import styled from "styled-components";

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #46385a;
  border: 0.2px solid #46385a;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
`;

export const StyledTopImage = styled.img`
  align-self: center;
  padding-top: 9px;
`;

export const StyledBottomImage = styled.img`
  position: relative;
  bottom: 37px;
  left: 22px;
`;

export const StyledTitle = styled.div`
  font-size: 24px;
  font-weight: 900;
  line-height: 55px;
  color: #ffffff;
  padding-left: 25px;
  position: relative;
  bottom: 36px;
`;

export const BottomContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  bottom: 30px;
  padding-left: 25px;
`;

export const CountContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background: #352a50;
  border-radius: 12px;
  padding: 8px;
  color: #fff;
  font-size: 15px;
  line-height: 0px;
  font-weight: 900;
  width: 80px;
`;

export const PriceContainer = styled.div`
  background: #352a50;
  border-radius: 12px;
  margin-right: 8px;
`;

export const BottomText = styled.div`
  color: #fff;
  font-size: 15px;
  line-height: 0px;
  padding: 18px;
  font-weight: 900;
`;
