import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import { useAuth } from 'react-oidc-context';


function App() {
  var [greeting, setGreeting] = useState<string>("");
  useEffect(()=>{
    const fetchData = async () => {
      try{
        const response = await fetch("https://racingapi.herenow.com/ping/anonymous");
        if(response.ok){
          const data = await response.text();
          setGreeting(data);
        }else{
          console.log(`Error fetching greeting: ${response.status}`);
        }
      }catch(e){
        console.log(`caught fetch error: ${e}`);
      }
    };
    fetchData();
  },[]);

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
      try{
        const response = await fetch(url, options);
        if(response.ok){
          const jsonClaims = await response.json();
          setClaims(jsonClaims);
        }else{
          if(response.status === 401){
            setClaims([]);
            auth.signinRedirect({redirect_uri: "http://localhost:3000"});
          }
          console.log(`Error fetching greeting: ${response.status}`);
        }
      }catch(e){
        console.log(`error attempting fetch: ${e}`);
      }
    };
    fetchData();
  },[auth]);

  const authenticationInfo = auth.isAuthenticated && 
  (<div>
    <h2>Authentication Info</h2>
    <div><i>Default information in access token</i></div>
    <br/>
    <b>User sub:</b> {auth.user?.profile.sub}{" "}
  </div>);


  const claimViews = claims.map((claim: any) => {
    return <div key={`${claim.type}_${claim.value}`}><b>{claim.type}</b>: {claim.value}</div>
  });
  const claimsView = (auth.isAuthenticated && claims) && 
    (<div>
      <h2>Claims</h2>
      <div><i>loaded from access token after authenticated</i></div>
      <br/>
      {claimViews}
    </div>);


  const userView = auth.isAuthenticated && (
    <div>
      <h2>Available User Info </h2>
      <div><i>loaded from IDP profile endpoint if loadUserInfo=true</i></div>
      <br/>
      <div><b>First:</b> {auth.user?.profile?.given_name}</div>
      <div><b>Last:</b> {auth.user?.profile?.family_name}</div>
      <div><b>Email:</b> {auth.user?.profile?.email}</div>
      </div>
  )

  const pingResponse = (auth.isAuthenticated && greeting) && (
    <div>
      <h2>API Response</h2>
      <div><i>Retrieved from API by supplying access token as bearer token</i></div>
      <br/>
      <b>Anonymous Ping:</b> {greeting}
    </div>);


  return (
    <div className="App">
      <h1>My HereNow App</h1>

      
      <Login/>

      {authenticationInfo}

      {claimsView}

      {userView}

      {pingResponse}
    </div>
  );
}

export default App;
