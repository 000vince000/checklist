import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { googleDriveService } from '../services/googleDriveService';

const Button = styled.button`
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
`;

// Update the global type definition
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
        };
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback?: (response: TokenResponse) => void;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

const GoogleAuthButton: React.FC = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return localStorage.getItem('isSignedIn') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google API script loaded');
        setIsGoogleLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google API script');
      };
      document.body.appendChild(script);
    };

    if (!window.google) {
      loadGoogleScript();
    } else {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        console.log('Initializing Google Sign-In');
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
        });

        // Check if user is already signed in
        if (isSignedIn) {
          window.dispatchEvent(new CustomEvent('authStateChange', { detail: true }));
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  }, [isGoogleLoaded, isSignedIn]);

  const handleCredentialResponse = async (response: any) => {
    if (response.credential) {
      console.log('Successfully signed in with Google');
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      const email = decodedToken.email;
      setUserEmail(email);
      setIsSignedIn(true);
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem('userEmail', email);
      googleDriveService.setUsername(email);
      console.log('Username set in googleDriveService:', email);
      window.dispatchEvent(new CustomEvent('authStateChange', { detail: { isSignedIn: true, email } }));

      // Add this line to fetch shared tasks
      await googleDriveService.fetchSharedTasks();
    } else {
      console.error('Failed to sign in with Google');
      handleSignOut();
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserEmail(null);
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('userEmail');
    googleDriveService.setUsername('');
    console.log('Username cleared in googleDriveService'); // Add this log
    window.dispatchEvent(new CustomEvent('authStateChange', { detail: { isSignedIn: false, email: null } }));
  };

  const handleClick = () => {
    console.log('Button clicked');
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google API not loaded');
    }
  };

  return (
    <div ref={buttonRef}>
      {!isGoogleLoaded && <Button onClick={handleClick}>Sign in with Google</Button>}
      {isGoogleLoaded && isSignedIn && <Button onClick={handleSignOut}>Sign Out</Button>}
    </div>
  );
};

export default GoogleAuthButton;