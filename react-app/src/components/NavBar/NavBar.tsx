import { FontIcon } from "@fluentui/react";
import * as React from "react";
import Logo from "./Logo/Logo";
import {
  SearchContainer,
  SignUpButton,
  StyledContainer,
  StyledFontIcon,
  StyledLink,
} from "./NavBar.styles";
import SearchInput from "./SearchInput/SearchInput";

const NavBar = () => {
  return (
    <StyledContainer>
      <Logo />
      <SearchContainer>
        <SearchInput />
        <StyledLink>Home</StyledLink>
        <StyledLink>Creators</StyledLink>
      </SearchContainer>
      <SignUpButton>Sign Up</SignUpButton>
      <StyledFontIcon>
        <FontIcon iconName="globalNavButton" className="text-gray-500" />
      </StyledFontIcon>
    </StyledContainer>
  );
};

export default NavBar;
