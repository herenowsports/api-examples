import React from "react";
import { useAuth } from "react-oidc-context";

function Login() {
    const auth = useAuth();

    switch (auth.activeNavigator) {
        case "signinSilent":
            return <div>Signing you in...</div>;
        case "signoutRedirect":
            return <div>Signing you out...</div>;
    }

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
        <div>
            <button onClick={() => {
                auth.signoutRedirect({post_logout_redirect_uri: "http://localhost:3000"});
            }}>Log out</button>
        </div>
        );
    }

    return <button onClick={() => void auth.signinRedirect({redirect_uri: "http://localhost:3000"})}>Log in</button>;
}

export default Login;