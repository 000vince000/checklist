import React, { useState, useEffect } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';
import LoginView from './LoginView';
import styled, { createGlobalStyle } from 'styled-components';
import { TaskProvider, useTaskContext } from '../context/TaskContext';
import { NewTaskButton } from '../styles/TaskStyles';

// Add this GlobalStyle component
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
  color: #e0e0e0;
  background-color: #1e1e1e;
  min-height: 100vh;
  box-sizing: border-box;

  @media (min-width: 768px) {
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

const ButtonAndFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    margin-top: 10px;
    justify-content: space-between;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    margin: 0px 0px; // Reduced margin for mobile 
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: flex-end;
  }
`;

const FilterDropdown = styled.select`
  padding: 8px;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: #ffffff;
  border: 1px solid #3498db;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 6px;
    font-size: 12px;
    max-width: 90px;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5);
  }
`;

const LuckyButtonStyled = styled(NewTaskButton)`
  background-color: transparent;
  border: 1px solid #FFA500;
  color: #FFA500;

  @media (max-width: 768px) {
    
  }

  &:hover {
    background-color: #FFA500;
    color: white;
  }
`;

const LuckyButton: React.FC<{ openMoodModal: () => void }> = ({ openMoodModal }) => {
  return <LuckyButtonStyled onClick={openMoodModal}>Feeling Lucky</LuckyButtonStyled>;
};

const Section = styled.section`
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1rem; // Reduced padding for mobile
    margin-bottom: 1rem; // Reduced margin for mobile
  }
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

  @media (max-width: 768px) {
    margin-bottom: 0rem; // Reduced margin for mobile
  }

  @media (min-width: 768px) {
    width: 300px;
    margin-bottom: 0px;
  }
`;

const SearchAndTopWordsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
  gap: 10px;
  flex-wrap: wrap; // Add this line

  @media (max-width: 768px) {
    // Remove the flex-direction: column; line
  }
`;

const TopWordButton = styled(LuckyButtonStyled)`
  font-size: 0.8rem;
  padding: 5px 10px;
`;

// Add this LoadingIndicator component
const LoadingIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  font-size: 24px;
`;

function App() {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return localStorage.getItem('isSignedIn') === 'true';
  });

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      if (e instanceof CustomEvent<boolean>) {
        setIsSignedIn(e.detail.isSignedIn);
        localStorage.setItem('isSignedIn', e.detail.isSignedIn);
      }
    };

    window.addEventListener('authStateChange', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('authStateChange', handleAuthChange as EventListener);
    };
  }, []);

  if (!isSignedIn) {
    return (
      <>
        <GlobalStyle />
        <LoginView />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </>
  );
}

function AppContent() {
  const { topWords, isLoading } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isTaskInputModalOpen, setIsTaskInputModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const openMoodModal = () => setIsMoodModalOpen(true);
  const closeMoodModal = () => setIsMoodModalOpen(false);
  const openTaskInputModal = () => setIsTaskInputModalOpen(true);
  const closeTaskInputModal = () => setIsTaskInputModalOpen(false);

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood);
    closeMoodModal();
  };

  const handleTopWordClick = (word: string) => {
    setSearchTerm(prevTerm => prevTerm === word ? '' : word);
  };

  return (
    <AppContainer>
      {isLoading && <LoadingIndicator>Loading...</LoadingIndicator>}
      <Header>
        <Title>Collaborative Checklist</Title>
        <ButtonAndFilterContainer>
          <ButtonContainer>
            <NewTaskButton onClick={openTaskInputModal}>+ New</NewTaskButton>
            <LuckyButton openMoodModal={openMoodModal} />
          </ButtonContainer>
          <FilterContainer>
            <FilterDropdown 
              value={attributeFilter} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAttributeFilter(e.target.value)}
            >
              <option value="all">Attributes</option>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="unimportant">Unimportant</option>
            </FilterDropdown>
            <FilterDropdown 
              value={typeFilter} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            >
              <option value="all">Types</option>
              <option value="debt">👻 Debt</option>
              <option value="cost">💸 Cost</option>
              <option value="revenue">💰 Revenue</option>
              <option value="happiness">❤️ Happiness</option>
            </FilterDropdown>
          </FilterContainer>
        </ButtonAndFilterContainer>
      </Header>
      <SearchAndTopWordsContainer>
        <SearchBar 
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        {topWords.map(([word, count]) => (
          <TopWordButton 
            key={word} 
            onClick={() => handleTopWordClick(word)}
            style={{ backgroundColor: searchTerm === word ? '#FFA500' : 'transparent' }}
          >
            {word} ({count})
          </TopWordButton>
        ))}
      </SearchAndTopWordsContainer>
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
      <TaskInput
        isOpen={isTaskInputModalOpen}
        closeModal={closeTaskInputModal}
      />
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
  );
}

export default App;
