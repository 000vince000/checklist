import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
`;

const GoogleAuthButton: React.FC = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

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
        console.log('Rendering Google Sign-In button');
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
        });
        console.log('Google Sign-In button rendered');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  }, [isGoogleLoaded]);

  const handleCredentialResponse = (response: any) => {
    console.log('Google Sign-In response:', response);
    if (response.credential) {
      console.log('Successfully signed in with Google');
    } else {
      console.error('Failed to sign in with Google');
    }
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
    </div>
  );
};

export default GoogleAuthButton;