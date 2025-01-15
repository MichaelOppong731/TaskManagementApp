import React from "react";
import  ReactDOM  from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./App";
import './App.css'
import './index.css'

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_1t8GeCu4t",
  client_id: "75j1g062tlpiqbdv3rndpo5nbp",
  redirect_uri: "http://localhost:5173/",
  response_type: "code",
  scope: "email openid phone",
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);