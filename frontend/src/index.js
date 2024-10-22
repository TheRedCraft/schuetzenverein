import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

try {
  ReactDOM.render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>,
    rootElement
  );
} catch (error) {
  console.error('Error rendering the app:', error);
  rootElement.innerHTML = '<h1>An error occurred while loading the application. Please check the console for more details.</h1>';
}
