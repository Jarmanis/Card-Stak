import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
	authority: "https://us-east-1nuni86pdc.auth.us-east-1.amazoncognito.com",
	client_id: "5gh0dubj45gj1oo07ptsiu05ks",
	redirect_uri: "https://card-stak.com",
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