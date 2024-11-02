import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { Task, CustomTaskType } from '../types/Task';
import { googleDriveService } from '../services/googleDriveService';
import { excludedWords, reservedWords, generateRandomTasks } from '../utils/taskUtils';

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
  isTaskInputModalOpen: boolean;
  openTaskInputModal: (parentTaskId: number | null, parentTaskName?: string) => void;
  closeTaskInputModal: () => void;
  parentTaskName: string | undefined;
  parentTaskId: number | null;
  customTypes: CustomTaskType[];
  setCustomTypes: React.Dispatch<React.SetStateAction<CustomTaskType[]>>;
  updateTaskTimer: (taskId: number, time: number, isRunning?: boolean, isStopped?: boolean) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const OPEN_TASKS_KEY = 'openTasks';
const CLOSED_TASKS_KEY = 'closedTasks';
const DELETED_TASKS_KEY = 'deletedTasks';

interface TaskState {
  openTasks: Task[];
  completedTasks: Task[];
  deletedTasks: Task[];
  taskTypes?: CustomTaskType[];
}

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskState, setTaskState] = useState<TaskState>({
    openTasks: [],
    completedTasks: [],
    deletedTasks: [],
    taskTypes: []
  });
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isTaskInputModalOpen, setIsTaskInputModalOpen] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<number | null>(null);
  const [parentTaskName, setParentTaskName] = useState<string | undefined>(undefined);
  const [customTypes, setCustomTypes] = useState<CustomTaskType[]>([]);
  const [runningTasks, setRunningTasks] = useState<Set<number>>(new Set());

  const updateLocalStorage = useCallback((taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[] }) => {
    if (taskStates.completedTasks && taskStates.openTasks) localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(taskStates.completedTasks));
    else if (taskStates.deletedTasks && taskStates.openTasks) localStorage.setItem(DELETED_TASKS_KEY, JSON.stringify(taskStates.deletedTasks));
    else if (taskStates.openTasks) localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(taskStates.openTasks));
  }, []);

  const saveToGoogleDrive = useCallback(async (taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[] }) => {
    const timestamp = new Date().toISOString();
    try {
      if (taskStates.completedTasks && taskStates.openTasks) {
        console.log(`[${timestamp}] Saving ${taskStates.completedTasks.length} completed tasks to Google Drive`);
        await googleDriveService.saveToGoogleDrive({completedTasks: taskStates.completedTasks, tasks: taskStates.openTasks});
      } else if (taskStates.deletedTasks && taskStates.openTasks) {
        console.log(`[${timestamp}] Saving ${taskStates.deletedTasks.length} deleted tasks to Google Drive`);
        await googleDriveService.saveToGoogleDrive({deletedTasks: taskStates.deletedTasks, tasks: taskStates.openTasks});
      } else if (taskStates.openTasks) {
        console.log(`[${timestamp}] Saving ${taskStates.openTasks.length} open tasks to Google Drive`);
        await googleDriveService.saveToGoogleDrive({tasks: taskStates.openTasks});
      }
    } catch (error) {
      console.error(`[${timestamp}] Error saving to Google Drive:`, error);
    }
  }, []);

  // Replace the debounced version with a direct implementation
  const updateStorageAndSync = useCallback(async (taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[] }) => {
    const timestamp = new Date().toISOString();
    updateLocalStorage(taskStates);
    await saveToGoogleDrive(taskStates);
  }, [updateLocalStorage, saveToGoogleDrive]);

  const syncTasksWithGoogleDrive = useCallback(async () => {
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
          deletedTasks: driveData.deletedTasks || [],
          taskTypes: driveData.taskTypes || []
        };
        setTaskState(newState);
        updateLocalStorage(newState);
        console.log('Tasks synced from Google Drive');
      } else {
        console.log('No data found in Google Drive, using local storage or generating random tasks');
        const localState: TaskState = {
          openTasks: JSON.parse(localStorage.getItem(OPEN_TASKS_KEY) || 'null') || generateRandomTasks(20),
          completedTasks: JSON.parse(localStorage.getItem(CLOSED_TASKS_KEY) || '[]'),
          deletedTasks: JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]'),
          taskTypes: JSON.parse(localStorage.getItem('taskTypes') || '[]')
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
        deletedTasks: JSON.parse(localStorage.getItem(DELETED_TASKS_KEY) || '[]'),
        taskTypes: JSON.parse(localStorage.getItem('taskTypes') || '[]')
      };
      setTaskState(localState);
      updateLocalStorage(localState);
    }
  }, [updateLocalStorage]);

  useEffect(() => {
    syncTasksWithGoogleDrive();
  }, [syncTasksWithGoogleDrive]);

  const addTask = useCallback((newTask: Task) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Adding new task:`, newTask);
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
      updateStorageAndSync({ openTasks: newState.openTasks });
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
      updateStorageAndSync({ openTasks: newState.openTasks });
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
        updateStorageAndSync({ openTasks: newState.openTasks, completedTasks: newState.completedTasks });
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
      if (!taskToDelete) {
        console.log(`Task with id ${taskId} not found, skipping delete operation`);
        return prevState;
      }
      // Check if the task is already in deletedTasks
      const isAlreadyDeleted = prevState.deletedTasks.some(task => task.id === taskId);
      if (isAlreadyDeleted) {
        console.log(`Task with id ${taskId} is already in deletedTasks, skipping delete operation`);
        return prevState;
      }
      const newState = {
        openTasks: prevState.openTasks.filter((task: Task) => task.id !== taskId),
        completedTasks: prevState.completedTasks,
        deletedTasks: [...prevState.deletedTasks, taskToDelete]
      };
      updateStorageAndSync({ openTasks: newState.openTasks, deletedTasks: newState.deletedTasks });
      return newState;
    });
  }, [updateStorageAndSync]);


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
      .slice(0, 4);
  }, [taskState.openTasks]);

  const prevTopWordsRef = useRef<[string, number][]>([]);

  useEffect(() => {
    if (JSON.stringify(topWords) !== JSON.stringify(prevTopWordsRef.current)) {
      console.log("Top 4 most frequent words in open tasks:");
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

  const openTaskInputModal = useCallback((parentId: number | null, parentName?: string) => {
    setParentTaskId(parentId);
    setParentTaskName(parentName);
    setIsTaskInputModalOpen(true);
  }, []);

  const closeTaskInputModal = useCallback(() => {
    setIsTaskInputModalOpen(false);
    setParentTaskId(null);
    setParentTaskName(undefined);
  }, []);

  useEffect(() => {
    const storedCustomTypes = localStorage.getItem('taskTypes');
    if (storedCustomTypes) {
      setCustomTypes(JSON.parse(storedCustomTypes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  const updateTaskTimer = useCallback((taskId: number, time: number, isRunning?: boolean, isStopped?: boolean) => {
    setTaskState(prevState => {
      const updatedTasks = prevState.openTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completionTime: time };
        }
        return task;
      });

      const newState = { ...prevState, openTasks: updatedTasks };

      if (isRunning !== undefined) {
        setRunningTasks(prev => {
          const newSet = new Set(prev);
          if (isRunning) {
            newSet.add(taskId);
          } else {
            newSet.delete(taskId);
          }
          return newSet;
        });
      }

      if (isStopped) {
        // Only update storage and sync when the timer is stopped
        updateStorageAndSync(newState);
      }

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
    animatingTaskId,
    topWords,
    isLoading,
    syncError,
    forceRefresh,
    isTaskInputModalOpen,
    openTaskInputModal,
    closeTaskInputModal,
    parentTaskName,
    parentTaskId,
    customTypes,
    setCustomTypes,
    updateTaskTimer,
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
