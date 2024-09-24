import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task } from '../types/Task';
import { saveToGoogleDrive, loadFromGoogleDrive } from '../utils/googleDriveUtils';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  completeTask: (taskId: number, completionTime: number) => void;
  deleteTask: (taskId: number) => void; // Add this new function
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(OPEN_TASKS_KEY);
    return savedTasks ? JSON.parse(savedTasks) : generateRandomTasks(20);
  });

  const [completedTasks, setCompletedTasks] = useState<Task[]>(() => {
    const savedCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);
    return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : [];
  });

  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  const saveToStorage = async () => {
    localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(completedTasks));
    
    // Save to Google Drive
    await saveToGoogleDrive(JSON.stringify(tasks), 'tasks.json');
    await saveToGoogleDrive(JSON.stringify(completedTasks), 'completedTasks.json');
  };

  const loadFromStorage = async () => {
    const localTasks = localStorage.getItem(OPEN_TASKS_KEY);
    const localCompletedTasks = localStorage.getItem(CLOSED_TASKS_KEY);

    // Try to load from Google Drive
    const driveTasks = await loadFromGoogleDrive('tasks.json');
    const driveCompletedTasks = await loadFromGoogleDrive('completedTasks.json');

    setTasks(driveTasks || (localTasks ? JSON.parse(localTasks) : generateRandomTasks(20)));
    setCompletedTasks(driveCompletedTasks || (localCompletedTasks ? JSON.parse(localCompletedTasks) : []));
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    saveToStorage();
  }, [tasks, completedTasks]);

  const addTask = (newTask: Task) => {
    console.log('Adding new task:', newTask);
    setAnimatingTaskId(newTask.id);
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }];
      console.log('Updated tasks after adding:', updatedTasks);
      return updatedTasks;
    });
    setTimeout(() => setAnimatingTaskId(null), 2000);
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      console.log('Updated tasks after updating:', updatedTasks);
      return updatedTasks;
    });
  };

  const completeTask = (taskId: number, completionTime: number) => {
    if (completingTasks.has(taskId)) {
      console.log('Task is already being completed:', taskId);
      return;
    }

    console.log('Completing task:', taskId);
    setAnimatingTaskId(taskId);
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    // Delay the removal of the task to allow for the animation
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      const taskToComplete = tasks.find(task => task.id === taskId);
      if (taskToComplete) {
        setCompletedTasks(prevCompletedTasks => [
          ...prevCompletedTasks,
          { ...taskToComplete, isCompleted: true, completionTime }
        ]);
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
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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