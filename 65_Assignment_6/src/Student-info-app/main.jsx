// Import React and the root app component
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Create the root React app and render it into the HTML element with id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
