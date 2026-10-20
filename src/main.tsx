import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { sanitizeCorruptedLocalStorage } from './utils/safeStorage';

// Prévenir les plantages dus à des clés de stockage corrompues
sanitizeCorruptedLocalStorage();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}


