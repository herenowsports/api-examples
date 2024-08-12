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

  const claimViews = claims.map((claim: any) => {
    return <div key={`${claim.type}_${claim.value}`}><b>{claim.type}</b>: {claim.value}</div>
  });

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

export default App;
