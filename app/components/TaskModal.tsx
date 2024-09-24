import React from 'react';
import styled from 'styled-components';
import { Task } from '../types/Task';
import { calculatePriority, formatTime } from '../utils/taskUtils';

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
  background-color: #3c3c3c;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  color: white;
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;

  &:hover,
  &:focus {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
  }
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  color: white;
`;

const AcceptButton = styled(ModalButton)`
  background-color: #4CAF50;
`;

const RejectButton = styled(ModalButton)`
  background-color: #f44336;
`;

const DoneButton = styled(ModalButton)`
  background-color: #2196F3;
`;

const Timer = styled.div`
  font-size: 24px;
  margin: 20px 0;
`;

const PauseButton = styled(ModalButton)`
  background-color: #FFA500;
`;

const AbandonButton = styled(ModalButton)`
  background-color: #8B0000;
`;

const DeleteButton = styled(ModalButton)`
  background-color: #8B0000; // Dark red color
  &:hover {
    background-color: #A52A2A; // Slightly lighter red on hover
  }
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
  handleDelete: () => void; // Add this new prop
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
  handleDelete, // Add this new prop
  timer,
  isPaused,
  tasks,
}) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={closeModal}>&times;</CloseButton>
        {selectedTask && (
          <div>
            <h2>{selectedTask.name}</h2>
            <p>Attribute: {selectedTask.attribute}</p>
            <p>External Dependency: {selectedTask.externalDependency}</p>
            <p>Effort: {selectedTask.effort}</p>
            <p>Type: {selectedTask.type}</p>
            <p>Note: {selectedTask.note}</p>
            <p>Priority Score: {calculatePriority(selectedTask, tasks).toFixed(2)}</p>
            <p>Rejection Count: {selectedTask.rejectionCount}</p>
            {timer === null ? (
              <>
                <AcceptButton onClick={handleAccept}>Accept</AcceptButton>
                <RejectButton onClick={handleReject}>Reject</RejectButton>
                <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
              </>
            ) : (
              <>
                <Timer>{formatTime(timer)}</Timer>
                <DoneButton onClick={handleDone}>Done</DoneButton>
                <PauseButton onClick={handlePause}>
                  {isPaused ? 'Resume' : 'Pause'}
                </PauseButton>
                <AbandonButton onClick={handleAbandon}>Abandon</AbandonButton>
              </>
            )}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;