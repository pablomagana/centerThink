import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { emailService } from '@/services/email.service';

// Inicializar EmailJS
emailService.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
