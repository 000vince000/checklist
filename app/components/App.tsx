import React, { useState, useEffect } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import LoginView from './LoginView';
import CommitHistoryHeatmap from './CommitHistoryHeatmap';
import CustomTypeModal from './CustomTypeModal';
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
  CompletedTaskItem,
  SearchBarContainer,
  ClearButton,
} from '../styles/AppStyles';
import { formatTime } from '../utils/taskUtils';
import { CustomTaskType } from '../types/Task';

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
  const [isCustomTypeModalOpen, setIsCustomTypeModalOpen] = useState(false);
  const [taskTypes, setTaskTypes] = useState<CustomTaskType[]>([]);
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

  useEffect(() => {
    const loadTaskTypes = () => {
      const storedTypes = localStorage.getItem('taskTypes');
      if (storedTypes) {
        setTaskTypes(JSON.parse(storedTypes));
      }
    };

    loadTaskTypes();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taskTypes') {
        loadTaskTypes();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'customize') {
      setIsCustomTypeModalOpen(true);
    } else {
      setTypeFilter(value);
    }
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
              onChange={handleTypeFilterChange}
            >
              <option value="all">Types</option>
              {taskTypes.map(type => (
                <option key={type.name} value={type.name.toLowerCase()}>{type.emoji} {type.name}</option>
              ))}
              <option value="customize">Customize types...</option>
            </FilterDropdown>
          </FilterContainer>
        </ButtonAndFilterContainer>
      </Header>
      <SearchAndTopWordsContainer>
        <SearchBarContainer>
          <SearchBar 
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>×</ClearButton>
          )}
        </SearchBarContainer>
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
      <CustomTypeModal
        isOpen={isCustomTypeModalOpen}
        onClose={() => setIsCustomTypeModalOpen(false)}
        onTypesUpdate={setTaskTypes}
      />
    </AppContainer>
  );
}

export default App;
