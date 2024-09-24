import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task } from '../types/Task';
import { calculatePriority, formatTime } from '../utils/taskUtils';
import { useTaskContext } from '../context/TaskContext';

const Modal = styled.div<{ isOpen: boolean }>`
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

const ModalContent = styled.div`
  background-color: #3c3c3c;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  color: white;
  position: relative;
`;

const CloseButton = styled.span`
  color: #aaa;
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;

  &:hover,
  &:focus {
    color: #fff;
    text-decoration: none;
  }
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  transition: background-color 0.3s;
`;

const AcceptButton = styled(ModalButton)`
  background-color: #4CAF50;
  &:hover { background-color: #45a049; }
`;

const RejectButton = styled(ModalButton)`
  background-color: #f44336;
  &:hover { background-color: #d32f2f; }
`;

const DoneButton = styled(ModalButton)`
  background-color: #2196F3;
  &:hover { background-color: #1e88e5; }
`;

const Timer = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const PauseButton = styled(ModalButton)`
  background-color: #FFA500;
  &:hover { background-color: #FF8C00; }
`;

const AbandonButton = styled(ModalButton)`
  background-color: #8B0000;
  &:hover { background-color: #A52A2A; }
`;

const DeleteButton = styled(ModalButton)`
  background-color: #8B0000;
  &:hover { background-color: #A52A2A; }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  margin-right: 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: white;
  font-size: 14px;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #2c2c2c;
  border: 1px solid #555;
  border-top: none;
  border-radius: 0 0 4px 4px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1;
`;

const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #3c3c3c;
  }
`;

const TaskDetails = styled.div`
  margin-bottom: 20px;
`;

const TaskProperty = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
`;

const PropertyLabel = styled.span`
  flex: 0 0 150px;
  margin-right: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 5px;
  background-color: #2c2c2c;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
`;

const Select = styled.select`
  flex: 1;
  padding: 5px;
  background-color: #2c2c2c;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const SaveButton = styled(ModalButton)`
  background-color: #3498db;
  &:hover { background-color: #2980b9; }
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
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              <Input
                type="text"
                name="name"
                value={editedTask.name}
                onChange={handleInputChange}
              />
            </h2>
            <SearchContainer>
              <SearchInput
                type="text"
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
                <PropertyLabel>Parent Task:</PropertyLabel>
                <span>{selectedParentTask ? selectedParentTask.name : 'None'}</span>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Attribute:</PropertyLabel>
                <Select name="attribute" value={editedTask.attribute} onChange={handleInputChange}>
                  <option value="urgent">Urgent</option>
                  <option value="important">Important</option>
                  <option value="unimportant">Unimportant</option>
                </Select>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>External Dependency:</PropertyLabel>
                <Select name="externalDependency" value={editedTask.externalDependency} onChange={handleInputChange}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Effort:</PropertyLabel>
                <Select name="effort" value={editedTask.effort} onChange={handleInputChange}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Select>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Type:</PropertyLabel>
                <Select name="type" value={editedTask.type} onChange={handleInputChange}>
                  <option value="debt">Debt</option>
                  <option value="cost">Cost</option>
                  <option value="revenue">Revenue</option>
                  <option value="happiness">Happiness</option>
                </Select>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Note:</PropertyLabel>
                <Input
                  type="text"
                  name="note"
                  value={editedTask.note || ''}
                  onChange={handleInputChange}
                />
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Priority Score:</PropertyLabel>
                <span>{calculatePriority(editedTask, tasks).toFixed(2)}</span>
              </TaskProperty>
              <TaskProperty>
                <PropertyLabel>Rejection Count:</PropertyLabel>
                <span>{editedTask.rejectionCount}</span>
              </TaskProperty>
            </TaskDetails>
            {timer !== null && <Timer>{formatTime(timer)}</Timer>}
            <ButtonGroup>
              {timer === null ? (
                <>
                  <AcceptButton onClick={handleAccept}>Accept</AcceptButton>
                  <RejectButton onClick={handleReject}>Reject</RejectButton>
                  <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
                  <SaveButton onClick={handleSave}>Save</SaveButton>
                </>
              ) : (
                <>
                  <DoneButton onClick={handleDone}>Done</DoneButton>
                  <PauseButton onClick={handlePause}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </PauseButton>
                  <AbandonButton onClick={handleAbandon}>Abandon</AbandonButton>
                </>
              )}
            </ButtonGroup>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;