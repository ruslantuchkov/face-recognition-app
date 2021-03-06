import React from 'react';
import { withRouter } from 'react-router';
import Tilt from 'react-tilt';
import brain from './brain.png';
import './Logo.css';

const Logo = props => {
  return (
    <div className="ma4 mt0">
      <Tilt
        className="Tilt br2 shadow-2"
        style={{ height: 150, width: 150 }}
        options={{ max: 55 }}
      >
        <div
          className="Tilt-inner pa3"
          onClick={() => props.history.push('/home')}
        >
          <img style={{ paddingTop: '10px' }} src={brain} alt="logo" />
        </div>
      </Tilt>
    </div>
  );
};

export default withRouter(Logo);
