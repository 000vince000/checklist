import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../types/Task';
import { calculatePriority, formatTime } from '../utils/taskUtils';
import { useTaskContext } from '../context/TaskContext';
import {
  Button,
  Modal,
  ModalContent,
  CloseButton,
  ModalHeader,
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
  ButtonGroup,
  DoneButton,
  PauseButton,
  AbandonButton,
  AcceptButton,
  RejectButton,
  DeleteButton,
  SaveButton,
  ActionButton
} from '../styles/TaskStyles';

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
}) => {
  const { tasks: allTasks, completedTasks } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [childTasks, setChildTasks] = useState<{id: number, name: string}[]>([]); // Change id type to number
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTask) {
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
      setEditedTask({
        ...editedTask,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSave = () => {
    if (editedTask) {
      handleUpdateTask(editedTask);
      closeModal();
    }
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchBlur = () => {
    // Use setTimeout to allow clicking on dropdown items before closing
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={closeModal}>&times;</CloseButton>
        {editedTask && (
          <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <FormGroup>
              <Label htmlFor="name">Task Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={editedTask.name}
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
                value={editedTask.attribute}
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
                value={editedTask.externalDependency}
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
                value={editedTask.effort}
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
                value={editedTask.type}
                onChange={handleInputChange}
              >
                <option value="debt">Debt</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="happiness">Happiness</option>
              </Select>
            </InlineFormGroup>
            <FormGroup>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                value={editedTask.note || ''}
                onChange={handleInputChange}
              />
            </FormGroup>
            <TaskDetails>
              {childTasks.length > 0 ? (
                <TaskProperty>
                  Subtasks:
                  <ul>
                    {childTasks.map(child => (
                      <li key={child.id}>{child.name} (ID: {child.id})</li>
                    ))}
                  </ul>
                </TaskProperty>
              ) : (
                <TaskProperty>No child tasks found</TaskProperty>
              )}
              <TaskProperty>
                Priority Score: {calculatePriority(editedTask, tasks).toFixed(2)}
              </TaskProperty>
              <TaskProperty>
                Rejection Count: {editedTask.rejectionCount}
              </TaskProperty>
            </TaskDetails>
            {timer !== null && (
              <TaskProperty>
                Timer: {formatTime(timer)}
              </TaskProperty>
            )}
            {timer === null ? (
              <ButtonGroup>
                <AcceptButton type="button" onClick={handleAccept}>Accept</AcceptButton>
                <RejectButton type="button" onClick={handleReject}>Reject</RejectButton>
                <DeleteButton type="button" onClick={handleDelete}>Delete</DeleteButton>
                <SaveButton type="submit">Save</SaveButton>
              </ButtonGroup>
            ) : (
              <ButtonGroup>
                <DoneButton onClick={handleDone}>Done</DoneButton>
                <PauseButton onClick={handlePause}>
                  {isPaused ? 'Resume' : 'Pause'}
                </PauseButton>
                <AbandonButton onClick={handleAbandon}>Abandon</AbandonButton>
              </ButtonGroup>
            )}
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;