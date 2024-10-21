import React, { useState, useEffect } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';
import LoginView from './LoginView';
import CommitHistoryHeatmap from './CommitHistoryHeatmap';
import { TaskProvider, useTaskContext } from '../context/TaskContext';
import { NewTaskButton } from '../styles/TaskStyles';
import {
  GlobalStyle,
  AppContainer,
  Header,
  Title,
  ButtonAndFilterContainer,
  ButtonContainer,
  FilterContainer,
  FilterDropdown,
  LuckyButtonStyled,
  Section,
  MoodModal,
  MoodModalContent,
  MoodButton,
  SearchBar,
  SearchAndTopWordsContainer,
  TopWordButton,
  LoadingIndicator,
  ExpandableRow,
  CompletedTasksSection,
  CompletedTaskItem
} from '../styles/AppStyles';
import { formatTime } from '../utils/taskUtils';

const LuckyButton: React.FC<{ openMoodModal: () => void }> = ({ openMoodModal }) => {
  return <LuckyButtonStyled onClick={openMoodModal}>Feeling Lucky</LuckyButtonStyled>;
};

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
  const { topWords, isLoading, isTaskInputModalOpen, openTaskInputModal, closeTaskInputModal, completedTasks } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCommitHistoryExpanded, setIsCommitHistoryExpanded] = useState(false);
  const [isCompletedTasksExpanded, setIsCompletedTasksExpanded] = useState(false);
  const openMoodModal = () => setIsMoodModalOpen(true);
  const closeMoodModal = () => setIsMoodModalOpen(false);

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood);
    closeMoodModal();
  };

  const handleTopWordClick = (word: string) => {
    setSearchTerm(prevTerm => prevTerm === word ? '' : word);
  };

  const openTaskModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    // You might need to fetch the task data here if it's not already available
    console.log('Opening task modal for task ID:', taskId); // Add this log
  };

  const toggleCommitHistory = () => {
    setIsCommitHistoryExpanded(!isCommitHistoryExpanded);
  };

  const toggleCompletedTasks = () => {
    setIsCompletedTasksExpanded(!isCompletedTasksExpanded);
  };

  return (
    <AppContainer>
      {isLoading && <LoadingIndicator>Loading...</LoadingIndicator>}
      <Header>
        <Title>Collaborative Checklist</Title>
        <ButtonAndFilterContainer>
          <ButtonContainer>
            <NewTaskButton onClick={() => openTaskInputModal(null)}>+ New</NewTaskButton>
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
      <ExpandableRow>
        <button onClick={toggleCompletedTasks}>
          {isCompletedTasksExpanded ? 'Hide' : 'Show'} Completed Tasks
        </button>
        {isCompletedTasksExpanded && (
          <CompletedTasksSection>
            {completedTasks.map(task => (
              <CompletedTaskItem key={task.id}>
              {task.name} - Completed in: {formatTime(task.completionTime || 0)}
            </CompletedTaskItem>
          ))}
          </CompletedTasksSection>
        )}
      </ExpandableRow>
      <ExpandableRow>
        <button onClick={toggleCommitHistory}>
          {isCommitHistoryExpanded ? 'Hide' : 'Show'} Action History
        </button>
        {isCommitHistoryExpanded && <CommitHistoryHeatmap />}
      </ExpandableRow>
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
