import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
	authority: import.meta.env.VITE_COGNITO_AUTHORITY || "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_nuni86pdc",
	client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || "5gh0dubj45gj1oo07ptsiu05ks",
	redirect_uri: window.location.origin,
	response_type: "code",
	scope: "openid email profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
	<React.StrictMode>
		<AuthProvider {...cognitoAuthConfig}>
			<App />
		</AuthProvider>
	</React.StrictMode>
);