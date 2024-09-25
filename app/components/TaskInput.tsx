import React, { useState } from 'react';
import { Task } from '../types/Task';
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
  TaskInputContainer,
  NewTaskButton
} from '../styles/TaskStyles';

const TaskInput: React.FC = () => {
  const { addTask } = useTaskContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    attribute: 'important',
    externalDependency: 'no',
    effort: 'medium',
    type: 'debt',
    rejectionCount: 0,
    isCompleted: false
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewTask({ ...newTask, [e.target.id]: e.target.value });
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
        isCompleted: false
      } as Task);
      setNewTask({
        attribute: 'important',
        externalDependency: 'no',
        effort: 'medium',
        type: 'debt'
      });
      closeModal();
    }
  };

  return (
    <TaskInputContainer>
      <NewTaskButton onClick={openModal}>+ New</NewTaskButton>
      <Modal isOpen={isModalOpen}>
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
                <option value="debt">Debt</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="happiness">Happiness</option>
              </Select>
            </InlineFormGroup>
            <FormGroup>
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" value={newTask.note || ''} onChange={handleInputChange} />
            </FormGroup>
            <SubmitButton type="submit">Add Task</SubmitButton>
          </Form>
        </ModalContent>
      </Modal>
    </TaskInputContainer>
  );
};

export default TaskInput;