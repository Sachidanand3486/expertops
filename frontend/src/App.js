import React from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import Upload from './Upload';
import FileList from './FileList';

function MainApp() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Log In</button>;
  }

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
      <Upload />
      <FileList />
    </div>
  );
}

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE
      }}
    >
      <MainApp />
    </Auth0Provider>
  );
}

export default App;
