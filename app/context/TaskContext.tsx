import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task } from '../types/Task';
import { saveToGoogleDrive, loadFromGoogleDrive } from '../utils/googleDriveUtils';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  completeTask: (taskId: number, completionTime: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const OPEN_TASKS_KEY = 'openTasks';
const CLOSED_TASKS_KEY = 'closedTasks';

// Helper function to generate random tasks
const generateRandomTasks = (count: number): Task[] => {
  const attributes = ['urgent', 'important', 'unimportant'] as const;
  const dependencies = ['yes', 'no'] as const;
  const efforts = ['l', 'm', 'h'] as const;
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

  const saveToLocalStorage = () => {
    localStorage.setItem(OPEN_TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(CLOSED_TASKS_KEY, JSON.stringify(completedTasks));
  };

  const saveToStorage = async () => {
    saveToLocalStorage();
    await saveToGoogleDrive(JSON.stringify(tasks), 'tasks.json');
    await saveToGoogleDrive(JSON.stringify(completedTasks), 'completedTasks.json');
  };

  useEffect(() => {
    saveToStorage();
  }, [tasks, completedTasks]);

  const addTask = (newTask: Task) => {
    console.log('Adding new task:', newTask);
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }];
      console.log('Updated tasks after adding:', updatedTasks);
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
      return updatedTasks;
    });
  };

  const completeTask = (taskId: number, completionTime: number) => {
    console.log('Completing task:', taskId);
    setTasks(prevTasks => {
      const taskToComplete = prevTasks.find(task => task.id === taskId);
      if (taskToComplete) {
        setCompletedTasks(prevCompletedTasks => [
          ...prevCompletedTasks,
          { ...taskToComplete, isCompleted: true, completionTime }
        ]);
      }
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      console.log('Updated tasks after completing:', updatedTasks);
      return updatedTasks;
    });
  };

  useEffect(() => {
    console.log('Current tasks:', tasks);
    console.log('Current completed tasks:', completedTasks);
  }, [tasks, completedTasks]);

  return (
    <TaskContext.Provider value={{ tasks, completedTasks, addTask, updateTask, completeTask }}>
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