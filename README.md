# api-examples
This repository contains public examples of how to use the HereNow APIs


** React Tutorial

A sample react app created using the Typescript template for [Create React App](https://create-react-app.dev) and using the [oidc-react-ts](https://github.com/authts/oidc-client-ts) npm library and [oidc-react-context](https://github.com/authts/react-oidc-context) helper library to handle authentication with the server. After authenticating, we make some authenticated calls to the server. 

cd into the directory that you want to contain the new app, and use create-react-app to start a new application:

```
npx create-react-app react-oidc --template typescript
cd react-oidc
npm start
```

Remove unnecessary content to simplify the app. In App.tsx, simplify the returned component to simply be:

```
function App() {
  return (
    <div className="App">
      <h1>My HereNow App</h1>
    </div>
  );
}
```

First we'll make an unauthenticated call to the HereNow server and display the returned greeting. The URL https://racingapi.herenow.com/ping/anonymous will return a "hello" when you call it. 

Add a call to useState to create a variable into which you'll insert the greeting. And then add a call to useEffect to make the API call:

```
function App() {
  var [greeting, setGreeting] = useState<string>("");
  useEffect(()=>{
    const fetchData = async () => {
      const response = await fetch("https://racingapi.herenow.com/ping/anonymous");
      if(response.ok){
        const data = await response.text();
        setGreeting(data);
      }else{
        console.log(`Error pinging server: ${response.status}`);
      }
    };
    fetchData();
  },[]);

  return (
    <div className="App">
      <h1>My HereNow App</h1>
      <div><b>Anonymous Ping:</b> {greeting}</div>
    </div>
  );
}
```

In order to talk to a protected API, you must have an access token from the HereNow identity provider. To manage the [Open ID Connect](https://openid.net/developers/how-connect-works/) and [OAuth 2.0](https://en.wikipedia.org/wiki/OAuth) based authentication flows, this tutorial uses [react-oidc-ts](https://github.com/authts/oidc-client-ts) with the [react-oidc-context](https://github.com/authts/react-oidc-context?tab=readme-ov-file) helper library to make things easier in the react app. 

Add the react-oidc-context and react-oidc-ts libraries:

```npm install oidc-client-ts react-oidc-context```

The react-oidc-context library sets up a React context provider that initiates authentication and maintains the user information for any child tags within the context. In `index.tsx`, import AuthProvider, set up the OIDC configuration and wrap your `App` component with the AuthProvider component. The HereNow identity provider has a URL of https://idp.herenow.com and the proper client ID to use with a react application is "reactjs". For the purposes of this tutorial, we'll assume your react app is running on the default port of 3000 using create-react-app's built in development server. 

The scope parameter should contain scopes for the things you want to access. 
- <b>openid</b>: the user's sub
- <b>email</b>: the user's email address
- <b>profile</b>: additional info about the user
- <b>racingapi</b>: a scope that allows access to API methods on the racing server
- <b>offline_access</b>: enables refresh tokens

The following code updates `index.tsx` with the OIDC config and the AuthProvider context tag:

```
... snip other imports ...
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: "https://idp.herenow.com",
  client_id: "reactjs",
  scope: "openid email profile racingapi offline_access",
  redirect_uri: "http://localhost:3000",
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
```

With the top level `index.html` doing the authentication, we can invoke the `useAuth` hook within subcomponents in the React app to gain access to the user information and access token that enables us to interact with HereNow protected APIs. 

Rather than let `App.tsx` grow too big, create a `Login.tsx` to hold the login status info and buttons to initiate login and logout. On the backend, refresh tokens are enabled, so on the front end, the "silent refresh" capability of oidc-react-ts can automatically get new access tokens as needed. Here is the code for a simple `Login.tsx`:

```
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
            <div><b>User sub:</b> {auth.user?.profile.sub}{" "}</div>
            <button onClick={() => {
                auth.signoutRedirect({post_logout_redirect_uri: "http://localhost:3000"});
            }}>Log out</button>
        </div>
        );
    }

    return <button onClick={() => void auth.signinRedirect({redirect_uri: "http://localhost:3000"})}>Log in</button>;
}

export default Login;
```

In your production app, you'll need to set log in redirect_uri attribute and the log out post_logout_redirect_uri attribute to point to your app. 

After creating the `Login.tsx` component, reference it in `App.tsx` like this:

```
... snip ...
    <div className="App">
      <h1>My HereNow App</h1>

      <div><b>Anonymous Ping:</b> {greeting}</div>
      
      <Login/>
    </div>
... snip ...
```

When you run the app now and log in, you'll be redirect to a log in page where you need to log in with a HereNow account or create a HereNow account if you don't already have one. Once you log in, you'll be redirected back to the app and the "sub" (short for Subject) will be shown in the React app. 

After authentication, the access token for making calls to the API is available on the `auth` object within the `useAuth` hook. Once you have a token, you may make an authenticated call to any API to retrieve data. The following code uses the access token and makes a call to show basic auth claims for the user in `App.tsx`: 

```
... snip ...
var [claims, setClaims] = useState<object[]>([]);
  var auth = useAuth();
  useEffect(()=>{
    const token = auth.user?.access_token;
    if(!token){
      return;
    }
    const fetchData = async () => {
      const url = "https://racingapi.herenow.com/ping/authenticated";
      const options =
      {
        method: "get",
        headers: {
          Authorization: `bearer ${token}`
        }
      };
      const response = await fetch(url, options);
      if(response.ok){
        const jsonClaims = await response.json();
        setClaims(jsonClaims);
      }else{
        console.log(`Error fetching claims: ${response.status}`);
      }
    };
    fetchData();
  },[auth]);
  
  const claimViews = claims.map((claim: any) => {
    return <div><b>{claim.type}</b>: {claim.value}</div>
  });

... snip ...

  return (
    <div className="App">
      <h1>My HereNow App</h1>

      <div><b>Anonymous Ping:</b> {greeting}</div>
      
      <Login/>
      
      {claims && 
        (<div>
          <h2>Claims</h2>
          {claimViews}
        </div>)}
    </div>
  );
}
... snip...

```

In OIDC authentication, when the user requests to log in, the react app must invoke the signinRedirect method to redirect the user to the login page on the HereNow identity provider to log in, and then the upon successful authentication, the HereNow identity provider redirects the user back to the react app with some query params on the redirect URL. The react-oidc-ts library automatically processes those query params to accept the authentication, but to keep things clean going forward, it is necessary to not leave those authentication response params on the URL. To handles this, create an event handler that cleans the URL upon the react app accepting the authentication response. The OIDC config allows for a callback to respond when the user successfully logs in. In that method, we can simply redirect to a clean URL to remove the authentication params once they've been processed. Update the oidcConfig to do a redirect to a clean URL:

```
const oidcConfig = {
  authority: "https://idp.herenow.com",
  client_id: "reactjs",
  redirect_uri: "http://localhost:3000",
  scope: "openid email profile racingapi offline_access",
  //loadUserInfo: true, // optionally call profile endpoint to retrieve first name, last name, and email
  onSigninCallback: () => {
    window.location.replace("/");
  }
};
```