// libraries
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
// redux
import { store } from './redux/store';
// utils
// eslint-disable-next-line no-undef
import './firebase';
import reportWebVitals from './reportWebVitals';
// components
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
