import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './tailwind.css'
import App from './App.jsx'

// Global fetch interceptor for ngrok tunneling
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  // Only add header for internal/relative requests
  const isExternal = typeof url === 'string' && (url.startsWith('http') && !url.includes(window.location.host));

  if (!isExternal) {
    options.headers = {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true',
    };
  }
  return originalFetch.call(this, url, options);
};

// Global XHR interceptor for socket.io polling/handshake
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
  this._isExternal = typeof url === 'string' && (url.startsWith('http') && !url.includes(window.location.host));
  return originalOpen.apply(this, arguments);
};

const originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  if (!this._isExternal) {
    this.setRequestHeader('ngrok-skip-browser-warning', 'true');
  }
  return originalSend.apply(this, arguments);
};

console.log("busMate application initializing...");

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Critical: Root element not found");
}