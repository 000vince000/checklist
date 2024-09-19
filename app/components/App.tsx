import React from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';
import styled from 'styled-components';
import { TaskProvider } from '../context/TaskContext';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
  color: #e0e0e0;
  background-color: #1e1e1e;
  min-height: 100vh;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
`;

const Section = styled.section`
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

function App() {
  return (
    <TaskProvider>
      <AppContainer>
        <Header>
          <Title>Collaborative Checklist</Title>
        </Header>
        <Section>
          <TaskInput />
        </Section>
        <Section>
          <TaskHeatmap />
        </Section>
        <Section>
          <TaskSuggestion />
        </Section>
      </AppContainer>
    </TaskProvider>
  );
}

export default App;