
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Mounting TradeFlow application...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
  throw new Error("Could not find root element to mount to");
}

window.addEventListener('error', (event) => {
  console.error('Global error detected:', event.error);
});

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Render call completed.");
} catch (err) {
  console.error("Failed to render App:", err);
}
