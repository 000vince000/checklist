import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { Task, CustomTaskType } from '../types/Task';
import { googleDriveService } from '../services/googleDriveService';
import { excludedWords, reservedWords, generateRandomTasks } from '../utils/taskUtils';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  deletedTasks: Task[];
  wipTasks: Task[];
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
const WIP_TASKS_KEY = 'wipTasks';

interface TaskState {
  openTasks: Task[];
  completedTasks: Task[];
  deletedTasks: Task[];
  wipTasks: Task[];
  taskTypes?: CustomTaskType[];
}

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskState, setTaskState] = useState<TaskState>({
    openTasks: [],
    completedTasks: [],
    deletedTasks: [],
    wipTasks: [],
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
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const updateLocalStorage = useCallback((taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[], wipTasks?: Task[], taskTypes?: CustomTaskType[] }) => {
    if (taskStates.completedTasks) localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(taskStates.completedTasks));
    if (taskStates.deletedTasks) localStorage.setItem(DELETED_TASKS_KEY, JSON.stringify(taskStates.deletedTasks));
    if (taskStates.openTasks) localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(taskStates.openTasks));
    if (taskStates.wipTasks) localStorage.setItem(WIP_TASKS_KEY, JSON.stringify(taskStates.wipTasks));
    if (taskStates.taskTypes) localStorage.setItem('taskTypes', JSON.stringify(taskStates.taskTypes));
  }, []);

  const saveToGoogleDrive = useCallback(async (taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[], wipTasks?: Task[] }) => {
    const timestamp = new Date().toISOString();
    try {
      // Create a combined payload with all task collections present in taskStates
      const payload: any = {};
      
      if (taskStates.openTasks) {
        payload.tasks = taskStates.openTasks;
        console.log(`[${timestamp}] Including ${taskStates.openTasks.length} open tasks in Google Drive sync`);
      }
      
      if (taskStates.completedTasks) {
        payload.completedTasks = taskStates.completedTasks;
        console.log(`[${timestamp}] Including ${taskStates.completedTasks.length} completed tasks in Google Drive sync`);
      }
      
      if (taskStates.deletedTasks) {
        payload.deletedTasks = taskStates.deletedTasks;
        console.log(`[${timestamp}] Including ${taskStates.deletedTasks.length} deleted tasks in Google Drive sync`);
      }
      
      if (taskStates.wipTasks) {
        payload.wipTasks = taskStates.wipTasks;
        console.log(`[${timestamp}] Including ${taskStates.wipTasks.length} in-progress tasks in Google Drive sync`);
      }
      
      // Only save if there's actual data to save
      if (Object.keys(payload).length > 0) {
        console.log(`[${timestamp}] Saving task data to Google Drive`);
        // Add this save operation to the queue
        saveQueueRef.current = saveQueueRef.current.then(async () => {
          await googleDriveService.saveToGoogleDrive(payload);
        });
        await saveQueueRef.current;
      }
    } catch (error) {
      console.error(`[${timestamp}] Error saving to Google Drive:`, error);
      throw error;
    }
  }, []);

  // Replace the debounced version with a direct implementation
  const updateStorageAndSync = useCallback(async (taskStates: { openTasks?: Task[], completedTasks?: Task[], deletedTasks?: Task[], wipTasks?: Task[], taskTypes?: CustomTaskType[] }) => {
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
          wipTasks: driveData.wipTasks || [],
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
          wipTasks: JSON.parse(localStorage.getItem(WIP_TASKS_KEY) || '[]'),
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
        wipTasks: JSON.parse(localStorage.getItem(WIP_TASKS_KEY) || '[]'),
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
      
      // Check if task is in openTasks or wipTasks
      const isInOpenTasks = prevState.openTasks.some(task => task.id === updatedTask.id);
      const isInWipTasks = prevState.wipTasks.some(task => task.id === updatedTask.id);
      
      let newState = { ...prevState };
      
      // Update the task in the appropriate collection
      if (isInOpenTasks) {
        newState = {
          ...newState,
          openTasks: prevState.openTasks.map(task => 
            task.id === updatedTask.id ? taskWithUpdatedAt : task
          )
        };
      } else if (isInWipTasks) {
        newState = {
          ...newState,
          wipTasks: prevState.wipTasks.map(task => 
            task.id === updatedTask.id ? { ...taskWithUpdatedAt, isRunning: true } : task
          )
        };
      } else {
        console.warn(`Task with id ${updatedTask.id} not found in either open or WIP tasks lists`);
        return prevState;
      }
      
      // Only save the collections that were actually modified
      const savePayload: any = {};
      if (isInOpenTasks) savePayload.openTasks = newState.openTasks;
      if (isInWipTasks) savePayload.wipTasks = newState.wipTasks;
      
      updateStorageAndSync(savePayload);
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
        // Look for the task in both openTasks and wipTasks
        const taskToComplete = prevState.openTasks.find((task: Task) => task.id === taskId) ||
                            prevState.wipTasks.find((task: Task) => task.id === taskId);
        
        if (!taskToComplete) {
          console.warn(`Task with id ${taskId} not found in either open or WIP tasks lists`);
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
          deletedTasks: prevState.deletedTasks,
          wipTasks: prevState.wipTasks.filter((task: Task) => task.id !== taskId)
        };
        updateStorageAndSync({ 
          openTasks: newState.openTasks, 
          completedTasks: newState.completedTasks,
          wipTasks: newState.wipTasks 
        });
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
        deletedTasks: [...prevState.deletedTasks, taskToDelete],
        wipTasks: prevState.wipTasks.filter((task: Task) => task.id !== taskId)
      };
      updateStorageAndSync({ 
        openTasks: newState.openTasks, 
        deletedTasks: newState.deletedTasks,
        wipTasks: newState.wipTasks 
      });
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
    let hiddenStartTime: number | null = null;
    let visibilityTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Record the time when the document becomes hidden
        hiddenStartTime = Date.now();
      } else {
        // Check if the document was hidden for more than 2 minutes
        if (hiddenStartTime && Date.now() - hiddenStartTime >= 120000) {
          console.log('Page was hidden for more than 2 minutes, triggering force refresh');
          forceRefresh();
        }
        hiddenStartTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Trigger force refresh on initial load
    forceRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
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
      const task = prevState.openTasks.find(t => t.id === taskId) || 
                prevState.wipTasks.find(t => t.id === taskId);
      
      if (!task) {
        console.warn(`Task with id ${taskId} not found in the tasks lists`);
        return prevState;
      }
      
      const updatedTask = { ...task, completionTime: time };
      let newState = { ...prevState };
      let shouldUpdateStorage = isStopped || false;

      if (isRunning !== undefined) {
        // Handle moving tasks between openTasks and wipTasks
        if (isRunning) {
          // Move task to wipTasks if it's not already there
          if (!prevState.wipTasks.some(t => t.id === taskId)) {
            const taskWithRunning = { ...updatedTask, isRunning: true };
            newState = {
              ...newState,
              openTasks: prevState.openTasks.filter(t => t.id !== taskId),
              wipTasks: [...prevState.wipTasks, taskWithRunning]
            };
            shouldUpdateStorage = true; // Force storage update when moving to wipTasks
          }
        } else {
          // Move task back to openTasks if it was in wipTasks
          if (prevState.wipTasks.some(t => t.id === taskId)) {
            newState = {
              ...newState,
              wipTasks: prevState.wipTasks.filter(t => t.id !== taskId),
              openTasks: [...prevState.openTasks, { ...updatedTask, isRunning: false }]
            };
            shouldUpdateStorage = true; // Force storage update when removing from wipTasks
          } else {
            // Just update the completion time for a task in openTasks
            newState = {
              ...newState,
              openTasks: prevState.openTasks.map(t => 
                t.id === taskId ? { ...t, completionTime: time } : t
              )
            };
          }
        }

        // Update the running tasks set outside of the state update
        if (isRunning) {
          setRunningTasks(prev => {
            const newSet = new Set(prev);
            newSet.add(taskId);
            return newSet;
          });
        } else {
          setRunningTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }
      } else {
        // Just update the completion time without changing task's location
        if (prevState.openTasks.some(t => t.id === taskId)) {
          newState = {
            ...newState,
            openTasks: prevState.openTasks.map(t => 
              t.id === taskId ? { ...t, completionTime: time } : t
            )
          };
        } else if (prevState.wipTasks.some(t => t.id === taskId)) {
          newState = {
            ...newState,
            wipTasks: prevState.wipTasks.map(t => 
              t.id === taskId ? { ...t, completionTime: time } : t
            )
          };
        }
      }

      // Always update storage and sync when state changes that affect task placement
      if (shouldUpdateStorage) {
        console.log('Persisting task state changes to storage');
        // Ensure both collections are saved to maintain consistency
        updateStorageAndSync({ 
          openTasks: newState.openTasks,
          wipTasks: newState.wipTasks
        });
      }

      return newState;
    });
  }, [updateStorageAndSync]);

  const contextValue = {
    tasks: taskState.openTasks,
    completedTasks: taskState.completedTasks,
    deletedTasks: taskState.deletedTasks,
    wipTasks: taskState.wipTasks,
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
