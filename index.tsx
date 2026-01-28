
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ResultsPage from './ResultsPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Simple routing based on URL path
const CurrentPage = window.location.pathname === '/results' ? ResultsPage : App;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CurrentPage />
  </React.StrictMode>
);
