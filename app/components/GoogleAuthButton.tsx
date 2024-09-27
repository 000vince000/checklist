import React, { useEffect, useState, useCallback } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleAuthButton: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleCredentialResponse = useCallback((response: CredentialResponse) => {
    console.log("Encoded JWT ID token: " + response.credential);
    setIsSignedIn(true);
    // Here you can send the token to your backend for verification
  }, []);

  useEffect(() => {
    console.log('GoogleAuthButton component rendered');
    console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    console.log('Current origin:', window.location.origin);

    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services script loaded');
        setIsGoogleLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Error loading Google Identity Services script:', error);
      };
      document.body.appendChild(script);
    };

    if (!window.google) {
      console.log('Loading Google Identity Services script');
      loadGoogleScript();
    } else {
      console.log('Google Identity Services already loaded');
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
    }
  }, [isGoogleLoaded, handleCredentialResponse]);

  const handleSignOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
      setIsSignedIn(false);
      console.log('User signed out.');
    }
  };

  if (!isGoogleLoaded) {
    return <div>Loading Google Sign-In...</div>;
  }

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <GoogleLogin
          onSuccess={handleCredentialResponse}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      )}
    </div>
  );
};

export default GoogleAuthButton;