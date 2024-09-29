import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import GoogleAuthButton from './GoogleAuthButton';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1e1e1e;
`;

const LoginView: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return localStorage.getItem('isSignedIn') === 'true';
  });

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      if (e instanceof CustomEvent<boolean>) {
        setIsSignedIn(e.detail);
      }
    };

    window.addEventListener('authStateChange', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('authStateChange', handleAuthChange as EventListener);
    };
  }, []);

  if (isSignedIn) {
    return null; // or you can render a loading spinner here
  }

  return (
    <LoginContainer>
      <GoogleAuthButton />
    </LoginContainer>
  );
};

export default LoginView;