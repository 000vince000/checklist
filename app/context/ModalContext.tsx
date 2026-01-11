import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '../types/Task';
import { useTaskContext } from './TaskContext';

interface ModalContextType {
  selectedTask: Task | null;
  openModal: (taskId: number, tasks: Task[], wipTasks: Task[]) => void;
  closeModal: () => void;
  handleAccept: (taskId: number) => void;
  handleReject: (task: Task, updateTask: (task: Task) => void) => void;
  handleDone: (taskId: number, completeTask: (id: number, time: number) => void) => void;
  handleAbandon: (task: Task, updateTask: (task: Task) => void) => void;
  handleDelete: (taskId: number, deleteTask: (id: number) => void) => void;
  handleUpdateTask: (task: Task, updateTask: (task: Task) => void) => void;
  updateSelectedTask: (task: Task) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { updateTaskStatus } = useTaskContext();

  const openModal = (taskId: number, tasks: Task[], wipTasks: Task[]) => {
    console.log('ModalContext: Opening modal for task id', taskId);
    const task = [...tasks, ...wipTasks].find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    } else {
      console.log('Task not found for id:', taskId);
    }
  };

  const closeModal = () => {
    console.log('ModalContext: Closing modal');
    setSelectedTask(null);
  };

  const handleAccept = (taskId: number) => {
    console.log('ModalContext: Accepting task', selectedTask);
    if (selectedTask) {
      // Update the task to be in progress
      updateTaskStatus(taskId, true);
    }
    closeModal();
  };

  const handleReject = (task: Task, updateTask: (task: Task) => void) => {
    console.log('ModalContext: Rejecting task', task);
    if (task) {
      const updatedTask = {
        ...task,
        rejectionCount: (task.rejectionCount || 0) + 1
      };
      updateTask(updatedTask);
      setSelectedTask(updatedTask);
    }
    closeModal();
  };

  const handleDone = (taskId: number, completeTask: (id: number, time: number) => void) => {
    console.log('ModalContext: Completing task', selectedTask);
    completeTask(taskId, 0);
    closeModal();
  };

  const handleAbandon = (task: Task, updateTask: (task: Task) => void) => {
    console.log('ModalContext: Abandoning task', task);
    // Move task back to open tasks by updating its state
    updateTaskStatus(task.id, false);
    closeModal();
  };

  const handleDelete = (taskId: number, deleteTask: (id: number) => void) => {
    console.log('ModalContext: Deleting task', selectedTask);
    deleteTask(taskId);
    closeModal();
  };

  const handleUpdateTask = (task: Task, updateTask: (task: Task) => void) => {
    console.log('ModalContext: Updating task', task);
    updateTask(task);
  };

  const updateSelectedTask = (task: Task) => {
    console.log('ModalContext: Updating selected task', task);
    setSelectedTask(task);
  };

  const value = {
    selectedTask,
    openModal,
    closeModal,
    handleAccept,
    handleReject,
    handleDone,
    handleAbandon,
    handleDelete,
    handleUpdateTask,
    updateSelectedTask
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}; 