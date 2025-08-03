import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx: Starting application...');
console.log('main.tsx: Environment variables check:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
});

const rootElement = document.getElementById('root');
console.log('main.tsx: Root element found:', !!rootElement);

if (!rootElement) {
  console.error('main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
console.log('main.tsx: React root created');

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('main.tsx: App rendered');
