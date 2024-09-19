import React, { useState } from 'react';
import styled from 'styled-components';
import { Task } from '../types/Task';

interface TaskInputProps {
  onAddTask: (task: Task) => void;
}

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 12px 24px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
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
  background-color: #fefefe;
  padding: 40px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
`;

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <Button onClick={openModal}>Add New Task</Button>
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
          <h2>Add New Task</h2>
          <Form>
            <FormGroup>
              <Label htmlFor="taskName">Task Name</Label>
              <Input type="text" id="taskName" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="attribute">Attribute</Label>
              <Select id="attribute">
                <option value="urgent">Urgent</option>
                <option value="important">Important</option>
                <option value="unimportant">Unimportant</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="externalDependency">External Dependency</Label>
              <Select id="externalDependency">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="effort">Effort</Label>
              <Select id="effort">
                <option value="l">Low</option>
                <option value="m">Medium</option>
                <option value="h">High</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="type">Type</Label>
              <Select id="type">
                <option value="debt">Debt</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="happiness">Happiness</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" />
            </FormGroup>
            <Button onClick={closeModal}>Add Task</Button>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TaskInput;