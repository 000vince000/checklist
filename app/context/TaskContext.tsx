import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Task } from '../types/Task';
import { googleDriveService } from '../services/googleDriveService';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  completeTask: (taskId: number, completionTime: number) => void;
  deleteTask: (taskId: number) => void;
  animatingTaskId: number | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const OPEN_TASKS_KEY = 'openTasks';
const CLOSED_TASKS_KEY = 'closedTasks';

// Helper function to generate random tasks
const generateRandomTasks = (count: number): Task[] => {
  const attributes = ['urgent', 'important', 'unimportant'] as const;
  const dependencies = ['yes', 'no'] as const;
  const efforts = ['small', 'medium', 'large'] as const;
  const types = ['debt', 'cost', 'revenue', 'happiness'] as const;

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Task ${i + 1}`,
    attribute: attributes[Math.floor(Math.random() * attributes.length)],
    externalDependency: dependencies[Math.floor(Math.random() * dependencies.length)],
    effort: efforts[Math.floor(Math.random() * efforts.length)],
    type: types[Math.floor(Math.random() * types.length)],
    note: `This is a random note for Task ${i + 1}`,
    rejectionCount: 0,
    isCompleted: false
  }));
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(completedTasks));
    console.log('Saved to local storage');
  }, [tasks, completedTasks]);

  const saveToGoogleDrive = useCallback(async () => {
    console.log('Saving to Google Drive');
    try {
      await googleDriveService.saveToGoogleDrive({ tasks, completedTasks });
      console.log('Tasks saved to Google Drive successfully');
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
    }
  }, [tasks, completedTasks]);

  const loadFromGoogleDrive = useCallback(async () => {
    try {
      const driveData = await googleDriveService.loadFromGoogleDrive();
      if (driveData) {
        setTasks(driveData.tasks);
        setCompletedTasks(driveData.completedTasks);
        console.log('Tasks loaded from Google Drive');
      } else {
        console.log('No data found in Google Drive, using local storage or generating random tasks');
        const localTasks = localStorage.getItem(OPEN_TASKS_KEY);
        const localCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);
        setTasks(localTasks ? JSON.parse(localTasks) : generateRandomTasks(20));
        setCompletedTasks(localCompletedTasks ? JSON.parse(localCompletedTasks) : []);
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      const localTasks = localStorage.getItem(OPEN_TASKS_KEY);
      const localCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);
      setTasks(localTasks ? JSON.parse(localTasks) : generateRandomTasks(20));
      setCompletedTasks(localCompletedTasks ? JSON.parse(localCompletedTasks) : []);
    }
  }, []);

  useEffect(() => {
    loadFromGoogleDrive();
  }, [loadFromGoogleDrive]);

  const addTask = (newTask: Task) => {
    console.log('Adding new task:', newTask);
    setAnimatingTaskId(newTask.id);
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }];
      console.log('Updated tasks after adding:', updatedTasks);
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    setTimeout(() => setAnimatingTaskId(null), 2000);
    saveToGoogleDrive();
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      console.log('Updated tasks after updating:', updatedTasks);
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    saveToGoogleDrive();
  };

  const completeTask = (taskId: number, completionTime: number) => {
    if (completingTasks.has(taskId)) {
      console.log('Task is already being completed:', taskId);
      return;
    }

    console.log('Completing task:', taskId);
    setAnimatingTaskId(taskId);
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    setTimeout(() => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task.id !== taskId);
        localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
      });
      setCompletedTasks(prevCompletedTasks => {
        const taskToComplete = tasks.find(task => task.id === taskId);
        if (taskToComplete) {
          const updatedCompletedTasks = [
            ...prevCompletedTasks,
            { ...taskToComplete, isCompleted: true, completionTime }
          ];
          localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(updatedCompletedTasks));
          return updatedCompletedTasks;
        }
        return prevCompletedTasks;
      });
      setAnimatingTaskId(null);
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      saveToGoogleDrive();
    }, 2000);
  };

  const deleteTask = (taskId: number) => {
    console.log('Deleting task:', taskId);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    saveToGoogleDrive();
  };

  useEffect(() => {
    console.log('Current tasks:', tasks);
    console.log('Current completed tasks:', completedTasks);
  }, [tasks, completedTasks]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      completedTasks, 
      addTask, 
      updateTask, 
      completeTask, 
      deleteTask, 
      animatingTaskId 
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};