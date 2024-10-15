import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../types/Task';
import { calculatePriority, formatTime } from '../utils/taskUtils';
import { useTaskContext } from '../context/TaskContext';
import {
  Button,
  Modal,
  ModalContent,
  Form,
  FormGroup,
  Label,
  Input,
  Select,
  Textarea,
  SubmitButton,
  InlineFormGroup,
  InlineLabel,
  DropdownItem,
  Dropdown,
  SearchContainer,
  SearchInput,
  TaskDetails,
  TaskProperty,
  DoneButton,
  PauseButton,
  AbandonButton,
  AcceptButton,
  RejectButton,
  DeleteButton,
  SaveButton,
  ActionButton,
  URLInputContainer,
  URLInput,
  URLIcon
} from '../styles/TaskStyles';
import {
  ModalHeaderStyled,
  LeftSection,
  BackButton,
  CloseButtonStyled,
  ButtonGroupStyled,
  SubtaskText,
  SubtaskButton
} from '../styles/TaskModalStyles';

import { isValidUrl } from '../utils/urlUtils';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface TaskModalProps {
  selectedTask: Task | null;
  isOpen: boolean;
  closeModal: () => void;
  handleAccept: () => void;
  handleReject: () => void;
  handleDone: () => void;
  handlePause: () => void;
  handleAbandon: () => void;
  handleDelete: () => void;
  handleUpdateTask: (updatedTask: Task) => void;
  timer: number | null;
  isPaused: boolean;
  tasks: Task[];
  openTaskModal: (taskId: number) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  selectedTask,
  isOpen,
  closeModal,
  handleAccept,
  handleReject,
  handleDone,
  handlePause,
  handleAbandon,
  handleDelete,
  handleUpdateTask,
  timer,
  isPaused,
  tasks,
  openTaskModal,
}) => {
  const { tasks: allTasks, completedTasks } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [childTasks, setChildTasks] = useState<{id: number, name: string}[]>([]); // Change id type to number
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    if (selectedTask) {
      setCurrentTask(selectedTask);
      setEditedTask(selectedTask);
      if (selectedTask.parentTaskId) {
        const parentTask = [...allTasks, ...completedTasks].find(task => task.id === selectedTask.parentTaskId);
        setSelectedParentTask(parentTask || null);
        setSearchTerm(parentTask ? parentTask.name : '');
      } else {
        setSelectedParentTask(null);
        setSearchTerm('');
      }
      // Search for child tasks
      console.log('Searching for child tasks of:', selectedTask.id);
      const children = [...allTasks, ...completedTasks]
        .filter(task => task.parentTaskId === selectedTask.id)
        .map(task => ({ id: task.id, name: task.name }));
      setChildTasks(children);
    }
  }, [selectedTask]); // Remove allTasks and completedTasks from the dependency array

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
    } else {
      const results = [...allTasks, ...completedTasks].filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase()) &&
        task.id !== editedTask?.id // Exclude the current task from search results
      );
      setSearchResults(results);
    }
  };

  const handleSelectParentTask = (task: Task | null) => {
    setSelectedParentTask(task);
    setSearchTerm('');
    setSearchResults([]);
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        parentTaskId: task ? task.id : null
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (editedTask) {
      const value = e.target.value;
      setEditedTask({
        ...editedTask,
        [e.target.name]: value === '' ? undefined : value
      });
    }
  };

  const handleSave = () => {
    if (editedTask) {
      // Remove the url property if it's an empty string
      const taskToSave = { ...editedTask };
      if (taskToSave.url === '') {
        delete taskToSave.url;
      }
      handleUpdateTask(taskToSave);
      closeModal();
    }
  };

  const handleGoToUrl = () => {
    if (editedTask && editedTask.url && isValidUrl(editedTask.url)) {
      window.open(editedTask.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchBlur = () => {
    // Use setTimeout to allow clicking on dropdown items before closing
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const handleOpenUrl = () => {
    if (editedTask && editedTask.url) {
      window.open(editedTask.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubtaskClick = (subtaskId: number) => {
    const subtask = [...allTasks, ...completedTasks].find(task => task.id === subtaskId);
    if (subtask) {
      setCurrentTask(subtask);
      setEditedTask(subtask);
      // Refresh child tasks for the new current task
      const children = [...allTasks, ...completedTasks]
        .filter(task => task.parentTaskId === subtask.id)
        .map(task => ({ id: task.id, name: task.name }));
      setChildTasks(children);
    }
  };

  const handleBackToParent = () => {
    if (currentTask && currentTask.parentTaskId) {
      const parentTask = [...allTasks, ...completedTasks].find(task => task.id === currentTask.parentTaskId);
      if (parentTask) {
        setCurrentTask(parentTask);
        setEditedTask(parentTask);
        // Refresh child tasks for the parent task
        const children = [...allTasks, ...completedTasks]
          .filter(task => task.parentTaskId === parentTask.id)
          .map(task => ({ id: task.id, name: task.name }));
        setChildTasks(children);
      }
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <ModalHeaderStyled>
          <LeftSection>
            {currentTask && currentTask.parentTaskId && (
              <BackButton onClick={handleBackToParent}>
                <FaArrowLeft />
              </BackButton>
            )}
          </LeftSection>
          <CloseButtonStyled onClick={closeModal}>&times;</CloseButtonStyled>
        </ModalHeaderStyled>
        {currentTask && (
          <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <FormGroup>
              <Label htmlFor="name">Task Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={currentTask.name}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="parentTask">Parent Task</Label>
              <SearchContainer>
                <SearchInput
                  ref={searchInputRef}
                  type="text"
                  id="parentTask"
                  placeholder={selectedParentTask ? selectedParentTask.name : "Search for parent task..."}
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {isDropdownOpen && (searchResults.length > 0 || selectedParentTask) && (
                  <Dropdown>
                    {selectedParentTask && (
                      <DropdownItem onClick={() => handleSelectParentTask(null)}>
                        Clear parent task
                      </DropdownItem>
                    )}
                    {searchResults.map(task => (
                      <DropdownItem 
                        key={task.id} 
                        onClick={() => handleSelectParentTask(task)}
                      >
                        {task.name}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
              </SearchContainer>
            </FormGroup>
            <InlineFormGroup>
              <InlineLabel htmlFor="attribute">Attribute</InlineLabel>
              <Select
                id="attribute"
                name="attribute"
                value={currentTask.attribute}
                onChange={handleInputChange}
              >
                <option value="urgent">Urgent</option>
                <option value="important">Important</option>
                <option value="unimportant">Unimportant</option>
              </Select>
            </InlineFormGroup>
            <InlineFormGroup>
              <InlineLabel htmlFor="externalDependency">External Dependency</InlineLabel>
              <Select
                id="externalDependency"
                name="externalDependency"
                value={currentTask.externalDependency}
                onChange={handleInputChange}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </InlineFormGroup>
            <InlineFormGroup>
              <InlineLabel htmlFor="effort">Effort</InlineLabel>
              <Select
                id="effort"
                name="effort"
                value={currentTask.effort}
                onChange={handleInputChange}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </InlineFormGroup>
            <InlineFormGroup>
              <InlineLabel htmlFor="type">Type</InlineLabel>
              <Select
                id="type"
                name="type"
                value={currentTask.type}
                onChange={handleInputChange}
              >
                <option value="debt">Debt</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="happiness">Happiness</option>
              </Select>
            </InlineFormGroup>
            <InlineFormGroup>
              <InlineLabel htmlFor="url">URL</InlineLabel>
              <URLInputContainer>
                <URLInput
                  type="text"
                  id="url"
                  name="url"
                  value={currentTask?.url || ''}
                  onChange={handleInputChange}
                  placeholder="Enter URL (optional)"
                />
                <URLIcon viewBox="0 0 24 24" onClick={handleOpenUrl}>
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </URLIcon>
              </URLInputContainer>
            </InlineFormGroup>
            <FormGroup>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                value={currentTask.note || ''}
                onChange={handleInputChange}
              />
            </FormGroup>
            <TaskDetails>
              {childTasks.length > 0 ? (
                <TaskProperty>
                  Subtasks:
                  <ul>
                    {childTasks.map(child => (
                      <li key={child.id}>
                        <SubtaskText>{child.name} </SubtaskText>
                        <SubtaskButton onClick={() => handleSubtaskClick(child.id)}>
                          <FaArrowRight />
                        </SubtaskButton>
                      </li>
                    ))}
                  </ul>
                </TaskProperty>
              ) : (
                <TaskProperty>No child tasks found</TaskProperty>
              )}
              <TaskProperty>
                Priority Score: {calculatePriority(currentTask, tasks).toFixed(2)}
              </TaskProperty>
              <TaskProperty>
                Rejection Count: {currentTask.rejectionCount}
              </TaskProperty>
            </TaskDetails>
            {timer !== null && (
              <TaskProperty>
                Timer: {formatTime(timer)}
              </TaskProperty>
            )}
            {timer === null ? (
              <ButtonGroupStyled>
                <AcceptButton type="button" onClick={handleAccept}>Accept</AcceptButton>
                <RejectButton type="button" onClick={handleReject}>Reject</RejectButton>
                <DeleteButton type="button" onClick={handleDelete}>Delete</DeleteButton>
                <SaveButton type="submit">Save</SaveButton>
              </ButtonGroupStyled>
            ) : (
              <ButtonGroupStyled>
                <DoneButton onClick={handleDone}>Done</DoneButton>
                <PauseButton onClick={handlePause}>
                  {isPaused ? 'Resume' : 'Pause'}
                </PauseButton>
                <AbandonButton onClick={handleAbandon}>Abandon</AbandonButton>
              </ButtonGroupStyled>
            )}
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;