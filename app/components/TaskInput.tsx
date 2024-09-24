import React, { useState } from 'react';
import styled from 'styled-components';
import { Task } from '../types/Task';
import { useTaskContext } from '../context/TaskContext';

const Button = styled.button`
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

interface ModalProps {
  isOpen: boolean;
}

const Modal = styled.div<ModalProps>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: #2c2c2c; // Darker background
  padding: 40px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #ffffff; // White text for better contrast
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #000;
  }
`;

const ModalHeader = styled.h2`
  color: #4CAF50; // Green color for the header
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 500;
  color: #4CAF50; // Green color for labels
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #4CAF50; // Green border
  border-radius: 4px;
  font-size: 16px;
  background-color: #3c3c3c; // Slightly lighter than the modal background
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #4CAF50; // Green border
  border-radius: 4px;
  font-size: 16px;
  background-color: #3c3c3c; // Slightly lighter than the modal background
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #4CAF50; // Green border
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  background-color: #3c3c3c; // Slightly lighter than the modal background
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  border: none;

  &:hover {
    background-color: #45a049;
  }
`;

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
    <div>
      <Button onClick={openModal}>+ New</Button>
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
          <ModalHeader>Add New Task</ModalHeader>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Task Name</Label>
              <Input type="text" id="name" value={newTask.name || ''} onChange={handleInputChange} required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="attribute">Attribute</Label>
              <Select id="attribute" value={newTask.attribute || ''} onChange={handleInputChange}>
                <option value="urgent">Urgent</option>
                <option value="important">Important</option>
                <option value="unimportant">Unimportant</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="externalDependency">External Dependency</Label>
              <Select id="externalDependency" value={newTask.externalDependency || ''} onChange={handleInputChange}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="effort">Effort</Label>
              <Select id="effort" value={newTask.effort || ''} onChange={handleInputChange}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="type">Type</Label>
              <Select id="type" value={newTask.type || ''} onChange={handleInputChange}>
                <option value="debt">Debt</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="happiness">Happiness</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" value={newTask.note || ''} onChange={handleInputChange} />
            </FormGroup>
            <SubmitButton type="submit">Add Task</SubmitButton>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TaskInput;