import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'tachyons';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';

axios.defaults.headers.common['Authorization'] = sessionStorage.getItem(
  'token'
);

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
