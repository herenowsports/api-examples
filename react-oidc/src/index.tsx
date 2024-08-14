import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: "https://idp.herenow.com",
  client_id: "reactjs",
  redirect_uri: "http://localhost:3000",
  scope: "openid email profile racingapi offline_access",
  loadUserInfo: true, // turn this on if you want to automatically call the profile endpoint to retrieve first name, last name, email, etc...
  onSigninCallback: () => {
    window.location.replace("/");
  }
  // ...
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
