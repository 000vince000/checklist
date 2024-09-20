import React, { useState, useEffect } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap, { LuckyButton } from './TaskHeatmap';
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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Section = styled.section`
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const MoodModal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const MoodModalContent = styled.div`
  background-color: #3c3c3c;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MoodButton = styled.button`
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

function App() {
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const openMoodModal = () => setIsMoodModalOpen(true);
  const closeMoodModal = () => setIsMoodModalOpen(false);

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood);
    closeMoodModal();
  };

  useEffect(() => {
    const initGoogleApi = async () => {
      await new Promise((resolve) => gapi.load('client', resolve));
      await gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: 'YOUR_CLIENT_ID',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file',
      });
    };

    initGoogleApi();
  }, []);

  return (
    <TaskProvider>
      <AppContainer>
        <Header>
          <Title>Collaborative Checklist</Title>
          <ButtonContainer>
            <TaskInput />
            <LuckyButton openMoodModal={openMoodModal} />
          </ButtonContainer>
        </Header>
        <Section>
          <TaskHeatmap selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
        </Section>
        <Section>
          <TaskSuggestion />
        </Section>
        <MoodModal isOpen={isMoodModalOpen}>
          <MoodModalContent>
            <h2>How are you feeling?</h2>
            <div>
              <MoodButton onClick={() => handleMoodSelection('💪')}>💪 Determined</MoodButton>
              <MoodButton onClick={() => handleMoodSelection('🧘')}>🧘 Zen</MoodButton>
              <MoodButton onClick={() => handleMoodSelection('🤓')}>🤓 Geeky</MoodButton>
              <MoodButton onClick={() => handleMoodSelection('🥱')}>🥱 Tired</MoodButton>
              <MoodButton onClick={() => handleMoodSelection('🤪')}>🤪 Bored</MoodButton>
            </div>
          </MoodModalContent>
        </MoodModal>
      </AppContainer>
    </TaskProvider>
  );
}

export default App;