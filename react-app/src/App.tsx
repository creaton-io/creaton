import React from 'react';
import logo from './logo.svg';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import graphql from 'babel-plugin-relay/macro';
// instead of:
//   import { graphql } from "babel-plugin-relay"

graphql`
  query AppQuery{
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    title
    subscriptionPrice
    avatarURL
    timestamp
  }
}
`;

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>

        <hr />

        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/">
            Home
          </Route>
          <Route path="/about">
            About
          </Route>
          <Route path="/dashboard">
            Dashboard
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
