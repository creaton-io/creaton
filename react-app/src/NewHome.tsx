import React from 'react';
import Explore from './components/Explore/Explore';
import NavBar from './components/NavBar/NavBar';
import {initializeIcons} from '@fluentui/font-icons-mdl2';
import BottomNav from './components/BottomNav/BottomNav';
import {BrowserRouter} from 'react-router-dom';
import styled from 'styled-components';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';

const StyledContainer = styled.div`
  background-color: #120821;
  width: 100%;
`;
initializeIcons();

function NewHome() {
  return (
    <BrowserRouter>
      <StyledContainer>
        <NavBar />
        <Home />
        <BottomNav />
        <Footer />
      </StyledContainer>
    </BrowserRouter>
  );
}

export default NewHome;
