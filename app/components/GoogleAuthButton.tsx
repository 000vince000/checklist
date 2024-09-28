import React, { useEffect, useState, useCallback } from 'react';
import { initializeGoogleDriveAPI, getAccessToken } from '../services/googleDriveService';

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

  const handleCredentialResponse = useCallback(async (response: any) => {
    if (response.credential) {
      localStorage.setItem('google_auth_token', response.credential);
      setIsSignedIn(true);
      console.log('User signed in');
      
      // Fetch and store access token
      try {
        await getAccessToken();
      } catch (error) {
        console.error('Error getting access token:', error);
      }
    }
  }, []);

  const checkSignInStatus = useCallback(async () => {
    const token = localStorage.getItem('google_auth_token');
    if (token) {
      try {
        // Verify the token with Google
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (response.ok) {
          setIsSignedIn(true);
          // Refresh the access token
          await getAccessToken();
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('google_auth_token');
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsSignedIn(false);
      }
    } else {
      setIsSignedIn(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await initializeGoogleDriveAPI();
      await checkSignInStatus();

      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true,
          prompt_parent_id: 'googleSignInDiv'
        });

        if (!isSignedIn) {
          window.google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
          );
          window.google.accounts.id.prompt();
        }
      } else {
        console.error('Google Identity Services not loaded properly');
      }
    };

    initializeAuth();
  }, [handleCredentialResponse, checkSignInStatus, isSignedIn]);

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