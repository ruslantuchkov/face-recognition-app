import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ isSignedIn }) => {
  if (isSignedIn) {
    return (
      <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/signout" className="f3 link dim black underline pa3 pointer">
          Sign Out
        </Link>
      </nav>
    );
  } else {
    return (
      <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/signin" className="f3 link dim black underline pa3 pointer">
          Sign In
        </Link>
        <Link
          to="/register"
          className="f3 link dim black underline pa3 pointer"
        >
          Register
        </Link>
      </nav>
    );
  }
};

export default Navigation;
