import React from 'react';
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
  return (
    <LoginContainer>
      <GoogleAuthButton />
    </LoginContainer>
  );
};

export default LoginView;