import React, { useState } from 'react';
import { Task } from '../types/Task';
import { useTaskContext } from '../context/TaskContext';
import {
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
  SearchContainer,
  SearchInput,
  Dropdown,
  DropdownItem,
  TaskProperty,
  TaskInputContainer,
  URLInputContainer,
  URLInput,
  URLIcon,
  NewTaskButton
} from '../styles/TaskStyles';

interface TaskInputProps {
  isOpen: boolean;
  closeModal: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ isOpen, closeModal }) => {
  const { addTask, tasks } = useTaskContext();
  const [newTask, setNewTask] = useState<Partial<Task>>({
    attribute: 'important',
    externalDependency: 'no',
    effort: 'medium',
    type: 'debt',
    rejectionCount: 0,
    isCompleted: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [url, setUrl] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewTask({ ...newTask, [e.target.id]: e.target.value });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
    } else {
      const results = tasks.filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const handleSelectParentTask = (task: Task | null) => {
    setSelectedParentTask(task);
    setSearchTerm(task ? task.name : '');
    setSearchResults([]);
    setNewTask({
      ...newTask,
      parentTaskId: task ? task.id : null
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.name) {
      addTask({
        id: Date.now(),
        name: newTask.name,
        attribute: newTask.attribute as Task['attribute'],
        externalDependency: newTask.externalDependency as Task['externalDependency'],
        effort: newTask.effort as Task['effort'],
        type: newTask.type as Task['type'],
        note: newTask.note,
        rejectionCount: 0,
        isCompleted: false,
        parentTaskId: newTask.parentTaskId,
        url: url.trim() !== '' ? url.trim() : undefined
      } as Task);
      setNewTask({
        attribute: 'important',
        externalDependency: 'no',
        effort: 'medium',
        type: 'debt'
      });
      setSelectedParentTask(null);
      setSearchTerm('');
      setUrl('');
      closeModal();
    }
  };

  const handleOpenUrl = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={closeModal}>&times;</CloseButton>
        <ModalHeader>Add New Task</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Task Name</Label>
            <Input type="text" id="name" value={newTask.name || ''} onChange={handleInputChange} required />
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
          <InlineFormGroup>
            <InlineLabel htmlFor="attribute">Attribute</InlineLabel>
            <Select id="attribute" value={newTask.attribute || ''} onChange={handleInputChange}>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="unimportant">Unimportant</option>
            </Select>
          </InlineFormGroup>
          <InlineFormGroup>
            <InlineLabel htmlFor="externalDependency">External Dependency</InlineLabel>
            <Select id="externalDependency" value={newTask.externalDependency || ''} onChange={handleInputChange}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </InlineFormGroup>
          <InlineFormGroup>
            <InlineLabel htmlFor="effort">Effort</InlineLabel>
            <Select id="effort" value={newTask.effort || ''} onChange={handleInputChange}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </InlineFormGroup>
          <InlineFormGroup>
            <InlineLabel htmlFor="type">Type</InlineLabel>
            <Select id="type" value={newTask.type || ''} onChange={handleInputChange}>
              <option value="debt">Debt</option>
              <option value="cost">Cost</option>
              <option value="revenue">Revenue</option>
              <option value="happiness">Happiness</option>
            </Select>
          </InlineFormGroup>
          <InlineFormGroup>
            <InlineLabel htmlFor="taskUrl">URL</InlineLabel>
            <URLInputContainer>
              <URLInput
                type="text"
                id="taskUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (optional)"
              />
              <URLIcon viewBox="0 0 24 24" onClick={handleOpenUrl}>
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </URLIcon>
            </URLInputContainer>
          </InlineFormGroup>
          <FormGroup>
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" value={newTask.note || ''} onChange={handleInputChange} />
          </FormGroup>
          <NewTaskButton type="submit">Add Task</NewTaskButton>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default TaskInput;
