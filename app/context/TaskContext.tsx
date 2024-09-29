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
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(completedTasks));
    // We don't save deletedTasks to local storage
    console.log('Saved to local storage');
  }, [tasks, completedTasks]);

  const saveToGoogleDrive = useCallback(async () => {
    console.log('Saving to Google Drive');
    try {
      const currentTasks = JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || '[]');
      const currentCompletedTasks = JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]');
      const currentDeletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
      
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
  }, []); // No dependencies as it always reads from localStorage

  const saveChanges = useCallback(async () => {
    console.log('saveChanges called, current tasks:', tasks);
    console.log('Saving changes - starting with local storage');
    saveToLocalStorage();
    console.log('Local storage save completed');
    
    console.log('Starting Google Drive save');
    try {
      await saveToGoogleDrive();
      console.log('Google Drive save completed successfully');
    } catch (error) {
      console.error('Error during Google Drive save:', error);
      throw error; // Re-throw the error to be caught in the calling function
    }
  }, [saveToLocalStorage, saveToGoogleDrive, tasks]);

  const loadFromGoogleDrive = useCallback(async () => {
    try {
      const driveData = await googleDriveService.loadFromGoogleDrive();
      if (driveData) {
        setTasks(driveData.tasks);
        setCompletedTasks(driveData.completedTasks);
        setDeletedTasks(driveData.deletedTasks || []); // Add this line
        console.log('Tasks loaded from Google Drive');
      } else {
        console.log('No data found in Google Drive, using local storage or generating random tasks');
        const localTasks = localStorage.getItem(OPEN_TASKS_KEY);
        const localCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);
        setTasks(localTasks ? JSON.parse(localTasks) : generateRandomTasks(20));
        setCompletedTasks(localCompletedTasks ? JSON.parse(localCompletedTasks) : []);
        setDeletedTasks([]); // Initialize deletedTasks as empty
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      const localTasks = localStorage.getItem(OPEN_TASKS_KEY);
      const localCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);
      setTasks(localTasks ? JSON.parse(localTasks) : generateRandomTasks(20));
      setCompletedTasks(localCompletedTasks ? JSON.parse(localCompletedTasks) : []);
      setDeletedTasks([]); // Initialize deletedTasks as empty
    }
  }, []);

  useEffect(() => {
    loadFromGoogleDrive();
  }, [loadFromGoogleDrive]);

  const addTask = (newTask: Task) => {
    console.log('Adding new task:', newTask);

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }];
      console.log('Updated tasks after adding:', updatedTasks);
      
      // Save to local storage immediately after state update
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      console.log('New task saved to local storage');
      
      // Schedule Google Drive save for next tick
      Promise.resolve().then(() => {
        console.log('Saving to Google Drive');
        saveToGoogleDrive().catch(error => {
          console.error('Failed to save new task to Google Drive:', error);
        });
      });

      return updatedTasks;
    });
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      console.log('Updated tasks after updating:', updatedTasks);

      // Update local storage
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      console.log('Tasks updated in local storage');

      // Trigger remote upload
      setTimeout(() => {
        console.log('Saving to Google Drive after task update');
        saveToGoogleDrive().catch(error => {
          console.error('Failed to save task update to Google Drive:', error);
        });
      }, 0);

      return updatedTasks;
    });
  };

  const completeTask = async (taskId: number, completionTime: number) => {
    if (completingTasks.has(taskId)) {
      console.log('Task is already being completed:', taskId);
      return;
    }

    console.log('Completing task:', taskId);
    setAnimatingTaskId(taskId);
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    setTimeout(async () => {
      let updatedTasks: Task[] = [];
      let updatedCompletedTasks: Task[] = [];

      setTasks(prevTasks => {
        updatedTasks = prevTasks.filter(task => task.id !== taskId);
        return updatedTasks;
      });

      setCompletedTasks(prevCompletedTasks => {
        const taskToComplete = tasks.find(task => task.id === taskId);
        if (taskToComplete) {
          updatedCompletedTasks = [
            ...prevCompletedTasks,
            { ...taskToComplete, isCompleted: true, completionTime }
          ];
          return updatedCompletedTasks;
        }
        return prevCompletedTasks;
      });

      // Update local storage
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(updatedCompletedTasks));
      console.log('Local storage updated after task completion');

      // Save to Google Drive with the most up-to-date data
      try {
        console.log('Saving to Google Drive after task completion');
        await googleDriveService.saveToGoogleDrive({
          tasks: updatedTasks,
          completedTasks: updatedCompletedTasks,
          deletedTasks: deletedTasks // Assuming deletedTasks is up-to-date
        });
        console.log('Task completion saved to Google Drive successfully');
      } catch (error) {
        console.error('Failed to save task completion to Google Drive:', error);
      }

      setAnimatingTaskId(null);
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 2000);
  };

  const deleteTask = (taskId: number) => {
    console.log('Deleting task:', taskId);

    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      const taskToDelete = prevTasks.find(task => task.id === taskId);

      // Update local storage immediately
      localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(updatedTasks));
      console.log('Task removed from local storage');

      if (taskToDelete) {
        setDeletedTasks(prevDeletedTasks => {
          const updatedDeletedTasks = [...prevDeletedTasks, taskToDelete];
          localStorage.setItem('deletedTasks', JSON.stringify(updatedDeletedTasks));
          console.log('Deleted task added to deletedTasks in local storage');
          return updatedDeletedTasks;
        });
      }

      return updatedTasks;
    });

    // Use setTimeout to ensure all state updates and local storage changes have been applied
    setTimeout(() => {
      const currentTasks = JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || '[]');
      const currentCompletedTasks = JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]');
      const currentDeletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');

      console.log('Saving to Google Drive after task deletion');
      googleDriveService.saveToGoogleDrive({
        tasks: currentTasks,
        completedTasks: currentCompletedTasks,
        deletedTasks: currentDeletedTasks
      }).catch(error => {
        console.error('Failed to save task deletion to Google Drive:', error);
      });
    }, 0);
  };

  useEffect(() => {
    console.log('Current tasks:', tasks);
    console.log('Current completed tasks:', completedTasks);
  }, [tasks, completedTasks]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      completedTasks, 
      deletedTasks, 
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