import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FactsProvider } from './context/FactsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FactsProvider>
    <App />
    </FactsProvider>
  </StrictMode>
);
