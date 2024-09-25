import React, { useState, useEffect } from 'react';
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
  AcceptButton,
  RejectButton,
  DeleteButton,
  SaveButton
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
            <FormGroup>
              <Label htmlFor="parentTask">Parent Task</Label>
              <SearchContainer>
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
            </FormGroup>
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
              <ButtonGroup>
                <AcceptButton type="button" onClick={handleAccept}>Accept</AcceptButton>
                <RejectButton type="button" onClick={handleReject}>Reject</RejectButton>
                <DeleteButton type="button" onClick={handleDelete}>Delete</DeleteButton>
                <SaveButton type="submit">Save</SaveButton>
              </ButtonGroup>
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
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;