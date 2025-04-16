import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import './index.css';

import { setAuthToken } from './services/api';
import { getAuthToken } from './utils/authStorage';

setAuthToken(getAuthToken());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
);
