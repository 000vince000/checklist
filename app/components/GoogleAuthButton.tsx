import React, { useEffect, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

declare global {
  interface Window {
    gapi: any;
    env: {
      REACT_APP_GOOGLE_CLIENT_ID: string;
      REACT_APP_GOOGLE_API_KEY: string;
      REACT_APP_GOOGLE_DISCOVERY_DOCS: string;
    };
  }
}

const GoogleAuthButton: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const loadGoogleAPI = () => {
      window.gapi.load('client:auth2', initClient);
    };

    const initClient = () => {
      const clientId = window.env.REACT_APP_GOOGLE_CLIENT_ID;
      const apiKey = window.env.REACT_APP_GOOGLE_API_KEY;
      const discoveryDocs = JSON.parse(window.env.REACT_APP_GOOGLE_DISCOVERY_DOCS || '[]');
      window.gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: discoveryDocs,
        scope: 'https://www.googleapis.com/auth/drive.file'
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(updateSignInStatus);
      }).catch((error: any) => {
        console.error('Error initializing Google API client:', error);
      });
    };

    const updateSignInStatus = (isSignedIn: boolean) => {
      setIsSignedIn(isSignedIn);
    };

    if (window.gapi) {
      loadGoogleAPI();
    } else {
      console.error('Google API not loaded');
    }
  }, []);

  const handleSignInClick = () => {
    window.gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOutClick = () => {
    window.gapi.auth2.getAuthInstance().signOut();
  };

  const handleGoogleLogin = (response: CredentialResponse) => {
    // Your login logic here
    console.log(response);
  };

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOutClick}>Sign Out</button>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      )}
    </div>
  );
};

export default GoogleAuthButton;