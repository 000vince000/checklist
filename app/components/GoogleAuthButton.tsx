import React, { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: () => void;
          getAuthResponse: () => { id_token: string } | null;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GoogleAuthButton: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleCredentialResponse = useCallback((response: any) => {
    if (response.credential) {
      setIsSignedIn(true);
      localStorage.setItem('google_auth_token', response.credential);
      console.log('User signed in');
    }
  }, []);

  const checkExistingSession = useCallback(() => {
    const token = localStorage.getItem('google_auth_token');
    if (token) {
      // Here, we're assuming the presence of a token means the user is signed in
      // In a production app, you might want to verify this token with your backend
      setIsSignedIn(true);
      console.log('Existing session found');
    }
  }, []);

  useEffect(() => {
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    googleScript.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });

        checkExistingSession();

        if (!isSignedIn) {
          window.google.accounts.id.renderButton(
            document.getElementById("googleSignInDiv"),
            { theme: "outline", size: "large" }
          );
          // Disable auto-select to prevent automatic sign-in prompts
          window.google.accounts.id.disableAutoSelect();
        }
      }
    };

    return () => {
      document.body.removeChild(googleScript);
    };
  }, [handleCredentialResponse, checkExistingSession, isSignedIn]);

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.removeItem('google_auth_token');
    console.log('User signed out');
    // Re-render the sign-in button
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    }
  };

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <div id="googleSignInDiv"></div>
      )}
    </div>
  );
};

export default GoogleAuthButton;