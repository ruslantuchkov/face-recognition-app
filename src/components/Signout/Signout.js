import React from 'react';
import { Redirect } from 'react-router';

const Signout = ({ clearState }) => {
  sessionStorage.removeItem('token');
  clearState();
  return <Redirect to="/signin" />;
};

export default Signout;
