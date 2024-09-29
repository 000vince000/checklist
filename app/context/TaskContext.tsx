import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Task } from '../types/Task';
import { googleDriveService } from '../services/googleDriveService';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  deletedTasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  completeTask: (taskId: number, completionTime: number) => void;
  deleteTask: (taskId: number) => void;
  animatingTaskId: number | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const OPEN_TASKS_KEY = 'openTasks';
const CLOSED_TASKS_KEY = 'closedTasks';
const DELETED_TASKS_KEY = 'deletedTasks';

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
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  const updateLocalStorage = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`${key} updated in local storage`);
  }, []);

  const saveToGoogleDrive = useCallback(async () => {
    console.log('Saving to Google Drive');
    try {
      const currentTasks = JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || '[]');
      const currentCompletedTasks = JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]');
      const currentDeletedTasks = JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]');
      
      await googleDriveService.saveToGoogleDrive({ 
        tasks: currentTasks, 
        completedTasks: currentCompletedTasks, 
        deletedTasks: currentDeletedTasks 
      });
      console.log('Tasks saved to Google Drive successfully');
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }, []);

  const loadFromGoogleDrive = useCallback(async () => {
    try {
      const driveData = await googleDriveService.loadFromGoogleDrive();
      if (driveData) {
        setTasks(driveData.tasks);
        setCompletedTasks(driveData.completedTasks);
        setDeletedTasks(driveData.deletedTasks || []);
        updateLocalStorage(OPEN_TASKS_KEY, driveData.tasks);
        updateLocalStorage(CLOSED_TASKS_KEY, driveData.completedTasks);
        updateLocalStorage(DELETED_TASKS_KEY, driveData.deletedTasks);
        console.log('Tasks loaded from Google Drive');
      } else {
        console.log('No data found in Google Drive, using local storage or generating random tasks');
        const localTasks = JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || 'null') || generateRandomTasks(20);
        const localCompletedTasks = JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]');
        const localDeletedTasks = JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]');
        setTasks(localTasks);
        setCompletedTasks(localCompletedTasks);
        setDeletedTasks(localDeletedTasks);
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      // Fallback to local storage or generate random tasks
      const localTasks = JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || 'null') || generateRandomTasks(20);
      const localCompletedTasks = JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]');
      const localDeletedTasks = JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]');
      setTasks(localTasks);
      setCompletedTasks(localCompletedTasks);
      setDeletedTasks(localDeletedTasks);
    }
  }, [updateLocalStorage]);

  useEffect(() => {
    loadFromGoogleDrive();
  }, [loadFromGoogleDrive]);

  const addTask = useCallback((newTask: Task) => {
    console.log('Adding new task:', newTask);
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }];
      updateLocalStorage(OPEN_TASKS_KEY, updatedTasks);
      return updatedTasks;
    });
    saveToGoogleDrive().catch(error => console.error('Failed to save new task to Google Drive:', error));
  }, [updateLocalStorage, saveToGoogleDrive]);

  const updateTask = useCallback((updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
      updateLocalStorage(OPEN_TASKS_KEY, updatedTasks);
      return updatedTasks;
    });
    saveToGoogleDrive().catch(error => console.error('Failed to save task update to Google Drive:', error));
  }, [updateLocalStorage, saveToGoogleDrive]);

  const completeTask = useCallback((taskId: number, completionTime: number) => {
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
        updateLocalStorage(OPEN_TASKS_KEY, updatedTasks);
        return updatedTasks;
      });

      setCompletedTasks(prevCompletedTasks => {
        const taskToComplete = tasks.find(task => task.id === taskId);
        if (taskToComplete) {
          const updatedCompletedTasks = [
            ...prevCompletedTasks,
            { ...taskToComplete, isCompleted: true, completionTime }
          ];
          updateLocalStorage(CLOSED_TASKS_KEY, updatedCompletedTasks);
          return updatedCompletedTasks;
        }
        return prevCompletedTasks;
      });

      saveToGoogleDrive().catch(error => console.error('Failed to save task completion to Google Drive:', error));

      setAnimatingTaskId(null);
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 2000);
  }, [tasks, updateLocalStorage, saveToGoogleDrive, completingTasks]);

  const deleteTask = useCallback((taskId: number) => {
    console.log('Deleting task:', taskId);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      const taskToDelete = prevTasks.find(task => task.id === taskId);
      updateLocalStorage(OPEN_TASKS_KEY, updatedTasks);

      if (taskToDelete) {
        setDeletedTasks(prevDeletedTasks => {
          const updatedDeletedTasks = [...prevDeletedTasks, taskToDelete];
          updateLocalStorage(DELETED_TASKS_KEY, updatedDeletedTasks);
          return updatedDeletedTasks;
        });
      }

      return updatedTasks;
    });

    saveToGoogleDrive().catch(error => console.error('Failed to save task deletion to Google Drive:', error));
  }, [updateLocalStorage, saveToGoogleDrive]);

  useEffect(() => {
    console.log('Current tasks:', tasks);
    console.log('Current completed tasks:', completedTasks);
  }, [tasks, completedTasks]);

  const contextValue = {
    tasks,
    completedTasks,
    deletedTasks,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    animatingTaskId
  };

  return (
    <TaskContext.Provider value={contextValue}>
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