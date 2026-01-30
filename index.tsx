
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical React Mount Error:", error);
  rootElement.innerHTML = `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
      <div>
        <h1 style="color: #ef4444; font-size: 24px; font-weight: 800; margin-bottom: 10px;">BOOT_ERROR</h1>
        <p style="color: #64748b; font-size: 14px;">The application encountered a critical startup error. Please refresh.</p>
      </div>
    </div>
  `;
}
