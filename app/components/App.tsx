import React, { useState, useEffect } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap, { LuckyButton } from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';
import styled from 'styled-components';
import { TaskProvider } from '../context/TaskContext';

const AppContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
  color: #e0e0e0;
  background-color: #1e1e1e;
  min-height: 100vh;

  @media (min-width: 768px) {
    max-width: 1200px;
    padding: 2rem;
  }
`;

const Header = styled.header`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
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

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: #ffffff;
  font-size: 14px;

  @media (min-width: 768px) {
    width: 300px;
    margin-bottom: 0;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    justify-content: flex-start;
    margin-bottom: 2rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-left: 10px;
`;

const FilterDropdown = styled.select`
  padding: 8px;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: #ffffff;
  border: 1px solid #3498db; // Changed from #4CAF50 to #3498db (blue)
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5); // Changed from rgba(76, 175, 80, 0.5) to match new color
  }
`;

function App() {
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ButtonContainer>
              <TaskInput />
              <LuckyButton openMoodModal={openMoodModal} />
            </ButtonContainer>
            <FilterContainer>
              <FilterDropdown 
                value={attributeFilter} 
                onChange={(e) => setAttributeFilter(e.target.value)}
              >
                <option value="all">Attributes</option>
                <option value="urgent">Urgent</option>
                <option value="important">Important</option>
                <option value="unimportant">Unimportant</option>
              </FilterDropdown>
              <FilterDropdown 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Types</option>
                <option value="debt">👻 Debt</option>
                <option value="cost">💸 Cost</option>
                <option value="revenue">💰 Revenue</option>
                <option value="happiness">❤️ Happiness</option>
              </FilterDropdown>
            </FilterContainer>
          </div>
        </Header>
        <SearchContainer>
          <SearchBar 
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <Section>
          <TaskHeatmap 
            selectedMood={selectedMood} 
            setSelectedMood={setSelectedMood}
            searchTerm={searchTerm}
            attributeFilter={attributeFilter}
            typeFilter={typeFilter}
          />
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