import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import breakpoint from "../../common/breakpoint";

export const StyledContainer = styled.div`
  @media only screen and ${breakpoint.device.xs} {
    display: inherit;
  }
  @media only screen and ${breakpoint.device.sm} {
    display: none;
  }
  @media only screen and ${breakpoint.device.lg} {
    display: none;
  }
`;

const BottomNav = () => {
  return (
    <div>
      <StyledContainer className="bottom-0 fixed w-full backdrop-filter z-50 backdrop-blur">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <Link
              to="/"
              className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 m-auto hover-tab p-1"
                viewBox="0 0 20 20"
                fill="#35cc82"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            <Link
              to="/subscribers"
              className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 m-auto hover-tab p-1"
                viewBox="0 0 20 20"
                fill="#35cc82"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </Link>

            <Link
              to="/upload"
              className="filter scale-125 border-transparent text-green-500 hover:text-green-700 hover:border-green-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 m-auto hover-tab-green p-1"
                viewBox="0 0 20 20"
                fill="#35cc82"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              to="/creators"
              className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 m-auto hover-tab p-1"
                viewBox="0 0 20 20"
                fill="#35cc82"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              to="/subscribers/"
              className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 m-auto hover-tab p-1"
                viewBox="0 0 20 20"
                fill="#35cc82"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </StyledContainer>
    </div>
  );
};

export default BottomNav;