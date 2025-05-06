import React, { useState, useEffect } from 'react';
import { Task, CustomTaskType } from '../types/Task';
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
  const { addTask, tasks, parentTaskName, parentTaskId, customTypes } = useTaskContext();
  const [localCustomTypes, setLocalCustomTypes] = useState<CustomTaskType[]>(customTypes);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    attribute: 'unimportant',
    externalDependency: 'no',
    effort: 'small',
    rejectionCount: 0,
    isCompleted: false,
    parentTaskId: parentTaskId,
    type: customTypes.length > 0 ? customTypes[customTypes.length - 1].name.toLowerCase() : undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [url, setUrl] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('[TaskInput] Initial mount - customTypes:', customTypes);
    console.log('[TaskInput] Initial mount - localCustomTypes:', localCustomTypes);
  }, []);

  // Keep local state in sync with context
  useEffect(() => {
    console.log('[TaskInput] customTypes changed:', customTypes);
    console.log('[TaskInput] current localCustomTypes:', localCustomTypes);
    
    if (JSON.stringify(localCustomTypes) !== JSON.stringify(customTypes)) {
      console.log('[TaskInput] Updating localCustomTypes');
      setLocalCustomTypes(customTypes);
      if (customTypes.length > 0) {
        console.log('[TaskInput] Setting new task type:', customTypes[customTypes.length - 1].name.toLowerCase());
        setNewTask(prevTask => ({
          ...prevTask,
          type: customTypes[customTypes.length - 1].name.toLowerCase()
        }));
      }
    } else {
      console.log('[TaskInput] No update needed - types are the same');
    }
  }, [customTypes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.id === 'type') {
      console.log('[TaskInput] Type changed to:', e.target.value);
    }
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
        parentTaskId: parentTaskId, // Use the parentTaskId from context
        url: url.trim() !== '' ? url.trim() : undefined
      } as Task);
      setNewTask({
        attribute: 'unimportant',
        externalDependency: 'no',
        effort: 'small',
        type: customTypes.length > 0 ? customTypes[customTypes.length - 1].name.toLowerCase() : undefined,
        parentTaskId: null // Reset parentTaskId after adding the task
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
              {localCustomTypes.map(type => (
                <option key={type.name} value={type.name.toLowerCase()}>{type.emoji} {type.name}</option>
              ))}
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
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c2.76 0 5-2.24 5-5s-2.24-5-5-5h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
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
