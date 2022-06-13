import * as React from "react";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { Button } from "../../../UIComponents/Button/Button";
import styled from "styled-components";

const StyledContainer = styled.div`
  width: 50%;
`;

const SearchInput = () => {
  return (
    <StyledContainer className="flex justify-center pt-6">
      <div className="flex rounded-xl bg-white text-white bg-opacity-5 ring-4 sm:ring-8 ring-black ring-opacity-25 p-3 mb-5 w-full items-center">
        <input
          placeholder="Search"
          className="w-full bg-transparent focus:outline-none ml-3"
        />
        <FontIcon iconName="search" className="text-gray-500" />
      </div>
      <Button
        label="Search"
        size="small"
        className="hidden ml-4 bg-red-600 text-white h-14"
      />
    </StyledContainer>
  );
};

export default SearchInput;