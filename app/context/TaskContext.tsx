import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
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
  topWords: [string, number][];
  isLoading: boolean;
  syncError: string;
  forceRefresh: () => void;
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
    isCompleted: false,
    createdAt: new Date().toISOString().split('T')[0] // Add this line
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
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

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

  const syncTasksWithGoogleDrive = useCallback(async () => {
    console.log('syncTasksWithGoogleDrive called');
    try {
      const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
      if (!isSignedIn) {
        console.log('User not signed in, skipping Google Drive sync');
        return;
      }

      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.log('User email not found, skipping Google Drive sync');
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
        console.log('Tasks synced from Google Drive');
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
      console.error('Error syncing with Google Drive:', error);
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
    syncTasksWithGoogleDrive();
  }, [syncTasksWithGoogleDrive]);

  const addTask = useCallback((newTask: Task) => {
    console.log('Adding new task:', newTask);
    setTaskState((prevState: TaskState) => {
      const taskWithCreatedAt = {
        ...newTask,
        rejectionCount: 0,
        createdAt: new Date().toISOString().split('T')[0] // use only date without time
      };
      const newState = {
        ...prevState,
        openTasks: [...prevState.openTasks, taskWithCreatedAt]
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
      const taskWithUpdatedAt = {
        ...updatedTask,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      const newState = {
        ...prevState,
        openTasks: prevState.openTasks.map((task: Task) => task.id === updatedTask.id ? taskWithUpdatedAt : task)
      };
      updateStorageAndSync(newState);
      return newState;
    });
  }, [updateStorageAndSync]);

  const completeTask = useCallback((taskId: number, completionTime: number) => {
    if (completingTasks.has(taskId)) {
      return;
    }

    setAnimatingTaskId(taskId);
    setCompletingTasks((prev: Set<number>) => new Set(prev).add(taskId));
    
    setTimeout(() => {
      setTaskState((prevState: TaskState) => {
        const taskToComplete = prevState.openTasks.find((task: Task) => task.id === taskId);
        if (!taskToComplete) {
          console.warn(`Task with id ${taskId} not found in the tasks list`);
          return prevState;
        }
        const taskWithClosedAt = {
          ...taskToComplete,
          closedAt: new Date().toISOString().split('T')[0]
        };
        const completedTask = { ...taskWithClosedAt, isCompleted: true, completionTime };
        const newState = {
          openTasks: prevState.openTasks.filter((task: Task) => task.id !== taskId),
          completedTasks: [...prevState.completedTasks, completedTask],
          deletedTasks: prevState.deletedTasks
        };
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

  const excludedWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that']);
  const reservedWords = new Set(['id', 'name', 'attribute', 'externalDependency', 'effort', 'type', 'note', 'rejectionCount', 'isCompleted', 'completionTime','note','task','random']);

  const topWords = useMemo(() => {
    const openTasks = taskState.openTasks;
    const words = openTasks.flatMap(task => 
      (task.name.toLowerCase() + ' ' + (task.note || '').toLowerCase()).split(/\s+/)
    );
    const wordFrequency = words.reduce((acc, word) => {
      if (word.length > 2 && !excludedWords.has(word) && !reservedWords.has(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [taskState.openTasks]);

  const prevTopWordsRef = useRef<[string, number][]>([]);

  useEffect(() => {
    if (JSON.stringify(topWords) !== JSON.stringify(prevTopWordsRef.current)) {
      console.log("Top 3 most frequent words in open tasks:");
      topWords.forEach(([word, count], index) => {
        console.log(`${index + 1}. "${word}" (${count} occurrences)`);
      });
      prevTopWordsRef.current = topWords;
    }
  }, [topWords]);

  const forceRefresh = useCallback(async () => {
    console.log('Force refresh triggered');
    setIsLoading(true);
    try {
      await syncTasksWithGoogleDrive();
      console.log('Force refresh completed successfully');
    } catch (error) {
      console.error('Force refresh failed:', error);
      setSyncError('Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [syncTasksWithGoogleDrive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, triggering force refresh');
        forceRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Trigger force refresh on initial load
    forceRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceRefresh]);

  const contextValue = {
    tasks: taskState.openTasks,
    completedTasks: taskState.completedTasks,
    deletedTasks: taskState.deletedTasks,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    animatingTaskId,
    topWords,
    isLoading,
    syncError,
    forceRefresh
  };

  useEffect(() => {
    let lastUpdateTime = Date.now();
    let animationFrameId: number;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastUpdateTime;
      lastUpdateTime = now;

      setTaskState((prevState: TaskState) => {
        const updatedOpenTasks = prevState.openTasks.map(task => {
          if (task.isCompleted === false) {
            return {
              ...task,
              completionTime: (task.completionTime || 0) + elapsed / 1000
            };
          }
          return task;
        });

        return {
          ...prevState,
          openTasks: updatedOpenTasks
        };
      });

      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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