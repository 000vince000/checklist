import React, { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: () => void;
          revoke: (token: string, callback: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (options?: { prompt?: string }) => Promise<any>;
          };
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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });

        const token = localStorage.getItem('google_auth_token');
        if (token) {
          setIsSignedIn(true);
        } else {
          window.google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
          );
        }
      } else {
        console.error('Google Identity Services not loaded properly');
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCredentialResponse]);

  const handleSignOut = () => {
    const token = localStorage.getItem('google_auth_token');
    if (token && window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.revoke(token, () => {
        localStorage.removeItem('google_auth_token');
        setIsSignedIn(false);
        console.log('User signed out');
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large' }
        );
      });
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