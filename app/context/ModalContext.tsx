import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '../types/Task';

interface ModalContextType {
  selectedTask: Task | null;
  timer: number | null;
  timerRunning: boolean;
  openModal: (taskId: number, tasks: Task[], wipTasks: Task[]) => void;
  closeModal: () => void;
  handleAccept: (taskId: number, updateTaskTimer: (id: number, time: number, isWIP: boolean) => void) => void;
  handleReject: (task: Task, updateTask: (task: Task) => void) => void;
  handleDone: (taskId: number, time: number | null, completeTask: (id: number, time: number) => void) => void;
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
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const openModal = (taskId: number, tasks: Task[], wipTasks: Task[]) => {
    console.log('ModalContext: Opening modal for task id', taskId);
    const task = [...tasks, ...wipTasks].find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      if (wipTasks.some(t => t.id === taskId)) {
        setTimer(task.completionTime || 0);
        setTimerRunning(true);
      } else {
        setTimer(null);
        setTimerRunning(false);
      }
    } else {
      console.log('Task not found for id:', taskId);
    }
  };

  const closeModal = () => {
    console.log('ModalContext: Closing modal');
    setSelectedTask(null);
    setTimer(null);
    setTimerRunning(false);
  };

  const handleAccept = (taskId: number, updateTaskTimer: (id: number, time: number, isWIP: boolean) => void) => {
    console.log('ModalContext: Accepting task', selectedTask);
    if (selectedTask) {
      // Update the task to be in progress
      updateTaskTimer(taskId, 0, true);
      
      // Update UI state
      setTimer(0);
      setTimerRunning(true);
    }
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

  const handleDone = (taskId: number, time: number | null, completeTask: (id: number, time: number) => void) => {
    console.log('ModalContext: Completing task', selectedTask);
    if (time !== null) {
      completeTask(taskId, time);
    }
    setTimerRunning(false);
    closeModal();
  };

  const handleAbandon = (task: Task, updateTask: (task: Task) => void) => {
    console.log('ModalContext: Abandoning task', task);
    // Just close the modal without updating the task
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

  // Start a timer if timerRunning is true
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer !== null ? prevTimer + 1 : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const value = {
    selectedTask,
    timer,
    timerRunning,
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