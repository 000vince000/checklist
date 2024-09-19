import React, { useState } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';
import styled from 'styled-components';
import { Task } from '../types/Task';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
  color: #333;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #2c3e50;
`;

const Section = styled.section`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  return (
    <AppContainer>
      <Header>
        <Title>Collaborative Checklist</Title>
      </Header>
      <Section>
        <TaskInput onAddTask={handleAddTask} />
      </Section>
      <Section>
        <TaskHeatmap tasks={tasks} />
      </Section>
      <Section>
        <TaskSuggestion tasks={tasks} setTasks={setTasks} />
      </Section>
    </AppContainer>
  );
}

export default App;