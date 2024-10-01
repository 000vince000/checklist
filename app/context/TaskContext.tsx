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

interface TaskState {
  openTasks: Task[];
  completedTasks: Task[];
  deletedTasks: Task[];
}

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskState, setTaskState] = useState<TaskState>({
    openTasks: [],
    completedTasks: [],
    deletedTasks: []
  });
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  const updateLocalStorage = useCallback((state: TaskState) => {
    console.log('updateLocalStorage called');
    localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(state.openTasks));
    localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(state.completedTasks));
    localStorage.setItem(DELETED_TASKS_KEY, JSON.stringify(state.deletedTasks));
    console.log('Local storage updated');
  }, []);

  const saveToGoogleDrive = useCallback(async (state: TaskState) => {
    console.log('saveToGoogleDrive called');
    try {
      await googleDriveService.saveToGoogleDrive({
        tasks: state.openTasks,
        completedTasks: state.completedTasks,
        deletedTasks: state.deletedTasks
      });
      console.log('Tasks saved to Google Drive successfully');
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
    }
  }, []);

  const updateStorageAndSync = useCallback(async (newState: TaskState) => {
    console.log('updateStorageAndSync called');
    updateLocalStorage(newState);
    await saveToGoogleDrive(newState);
  }, [updateLocalStorage, saveToGoogleDrive]);

  const loadFromGoogleDrive = useCallback(async () => {
    console.log('loadFromGoogleDrive called');
    try {
      const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
      if (!isSignedIn) {
        console.log('User not signed in, skipping Google Drive load');
        return;
      }

      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.log('User email not found, skipping Google Drive load');
        return;
      }

      googleDriveService.setUsername(userEmail);

      const driveData = await googleDriveService.loadFromGoogleDrive();
      if (driveData) {
        const newState: TaskState = {
          openTasks: driveData.tasks,
          completedTasks: driveData.completedTasks,
          deletedTasks: driveData.deletedTasks || []
        };
        setTaskState(newState);
        updateLocalStorage(newState);
        console.log('Tasks loaded from Google Drive');
      } else {
        console.log('No data found in Google Drive, using local storage or generating random tasks');
        const localState: TaskState = {
          openTasks: JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || 'null') || generateRandomTasks(20),
          completedTasks: JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]'),
          deletedTasks: JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]')
        };
        setTaskState(localState);
        updateLocalStorage(localState);
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      // Fallback to local storage or generate random tasks
      const localState: TaskState = {
        openTasks: JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || 'null') || generateRandomTasks(20),
        completedTasks: JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]'),
        deletedTasks: JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]')
      };
      setTaskState(localState);
      updateLocalStorage(localState);
    }
  }, [updateLocalStorage]);

  useEffect(() => {
    console.log('useEffect hook triggered');
    loadFromGoogleDrive();
  }, [loadFromGoogleDrive]);

  const addTask = useCallback((newTask: Task) => {
    console.log('Adding new task:', newTask);
    setTaskState((prevState: TaskState) => {
      const newState = {
        ...prevState,
        openTasks: [...prevState.openTasks, { ...newTask, rejectionCount: 0, isCompleted: false }]
      };
      updateStorageAndSync(newState);
      return newState;
    });
    setAnimatingTaskId(newTask.id);
    setTimeout(() => setAnimatingTaskId(null), 500);
  }, [updateStorageAndSync]);

  const updateTask = useCallback((updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    setTaskState((prevState: TaskState) => {
      const newState = {
        ...prevState,
        openTasks: prevState.openTasks.map((task: Task) => task.id === updatedTask.id ? updatedTask : task)
      };
      updateStorageAndSync(newState);
      return newState;
    });
  }, [updateStorageAndSync]);

  const completeTask = useCallback((taskId: number, completionTime: number) => {
    console.log('completeTask called for taskId:', taskId);
    if (completingTasks.has(taskId)) {
      console.log('Task is already being completed:', taskId);
      return;
    }

    console.log('Starting to complete task:', taskId);
    setAnimatingTaskId(taskId);
    setCompletingTasks((prev: Set<number>) => new Set(prev).add(taskId));
    
    setTimeout(() => {
      console.log('setTimeout callback triggered for taskId:', taskId);
      setTaskState((prevState: TaskState) => {
        console.log('setTaskState callback triggered for taskId:', taskId);
        const taskToComplete = prevState.openTasks.find((task: Task) => task.id === taskId);
        if (!taskToComplete) {
          console.warn(`Task with id ${taskId} not found in the tasks list`);
          return prevState;
        }
        const completedTask = { ...taskToComplete, isCompleted: true, completionTime };
        const newState = {
          openTasks: prevState.openTasks.filter((task: Task) => task.id !== taskId),
          completedTasks: [...prevState.completedTasks, completedTask],
          deletedTasks: prevState.deletedTasks
        };
        console.log('Calling updateStorageAndSync from setTaskState');
        updateStorageAndSync(newState);
        return newState;
      });

      setAnimatingTaskId(null);
      setCompletingTasks((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      console.log('Task completion process finished for taskId:', taskId);
    }, 2000);
  }, [completingTasks, updateStorageAndSync]);

  const deleteTask = useCallback((taskId: number) => {
    console.log('Deleting task:', taskId);
    setTaskState((prevState: TaskState) => {
      const taskToDelete = prevState.openTasks.find((task: Task) => task.id === taskId);
      if (!taskToDelete) return prevState;
      const newState = {
        openTasks: prevState.openTasks.filter((task: Task) => task.id !== taskId),
        completedTasks: prevState.completedTasks,
        deletedTasks: [...prevState.deletedTasks, taskToDelete]
      };
      updateStorageAndSync(newState);
      return newState;
    });
  }, [updateStorageAndSync]);

  const contextValue = {
    tasks: taskState.openTasks,
    completedTasks: taskState.completedTasks,
    deletedTasks: taskState.deletedTasks,
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