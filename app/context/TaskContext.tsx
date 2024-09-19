import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Task } from '../types/Task';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  completeTask: (taskId: number, completionTime: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

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
  const [tasks, setTasks] = useState<Task[]>(() => generateRandomTasks(20));

  const addTask = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, { ...newTask, rejectionCount: 0, isCompleted: false }]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const completeTask = (taskId: number, completionTime: number) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: true, completionTime } : task
    ));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, completeTask }}>
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