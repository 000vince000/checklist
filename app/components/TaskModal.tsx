import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  SubmitButton
} from '../styles/TaskStyles';

// Additional styled components specific to TaskModal
const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #3c3c3c;
  border: 1px solid #4CAF50;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

const TaskDetails = styled.div`
  margin-bottom: 20px;
`;

const TaskProperty = styled.p`
  margin: 10px 0;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  &:hover { background-color: #2980b9; }
`;

const DeleteButton = styled(Button)`
  background-color: #8B0000;
  &:hover { background-color: #A52A2A; }
`;

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

  useEffect(() => {
    if (selectedTask) {
      setEditedTask(selectedTask);
      if (selectedTask.parentTaskId) {
        const parentTask = [...allTasks, ...completedTasks].find(task => task.id === selectedTask.parentTaskId);
        setSelectedParentTask(parentTask || null);
      } else {
        setSelectedParentTask(null);
      }
    }
  }, [selectedTask, allTasks, completedTasks]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
    } else {
      const results = [...allTasks, ...completedTasks].filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const handleSelectParentTask = (task: Task | null) => {
    setSelectedParentTask(task);
    setSearchTerm(task ? task.name : '');
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

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={closeModal}>&times;</CloseButton>
        {editedTask && (
          <>
            <ModalHeader>{editedTask.name}</ModalHeader>
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
                <Label htmlFor="attribute">Attribute</Label>
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
              </FormGroup>
              <FormGroup>
                <Label htmlFor="externalDependency">External Dependency</Label>
                <Select
                  id="externalDependency"
                  name="externalDependency"
                  value={editedTask.externalDependency}
                  onChange={handleInputChange}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="effort">Effort</Label>
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
              </FormGroup>
              <FormGroup>
                <Label htmlFor="type">Type</Label>
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
              </FormGroup>
              <FormGroup>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  name="note"
                  value={editedTask.note || ''}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <SearchContainer>
                <Label htmlFor="parentTask">Parent Task</Label>
                <SearchInput
                  type="text"
                  id="parentTask"
                  placeholder="Search for parent task..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchResults.length > 0 && (
                  <Dropdown>
                    <DropdownItem onClick={() => handleSelectParentTask(null)}>
                      None
                    </DropdownItem>
                    {searchResults.map(task => (
                      <DropdownItem key={task.id} onClick={() => handleSelectParentTask(task)}>
                        {task.name}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
              </SearchContainer>
              <TaskDetails>
                <TaskProperty>
                  Parent Task: {selectedParentTask ? selectedParentTask.name : 'None'}
                </TaskProperty>
                <TaskProperty>
                  Priority Score: {calculatePriority(editedTask, tasks).toFixed(2)}
                </TaskProperty>
                <TaskProperty>
                  Rejection Count: {editedTask.rejectionCount}
                </TaskProperty>
              </TaskDetails>
              {timer === null ? (
                <>
                  <Button onClick={handleAccept}>Accept</Button>
                  <Button onClick={handleReject}>Reject</Button>
                  <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
                  <SubmitButton type="submit">Save</SubmitButton>
                </>
              ) : (
                <>
                  <div>{formatTime(timer)}</div>
                  <Button onClick={handleDone}>Done</Button>
                  <Button onClick={handlePause}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={handleAbandon}>Abandon</Button>
                </>
              )}
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;