import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
	authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_nuni86pdc",
	client_id: "5gh0dubj45gj1oo07ptsiu05ks",
	redirect_uri: "https://card-stak.replit.app",
	response_type: "code",
	scope: "email openid phone",
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