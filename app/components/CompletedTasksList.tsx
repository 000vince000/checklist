import React from 'react';
import { Task } from '../types/Task';
import { formatTime } from '../utils/taskUtils';
import { CompletedTasksSection, CompletedTaskItem } from '../styles/AppStyles';

interface CompletedTasksListProps {
  tasks: Task[];
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ tasks }) => {
  console.log('[CompletedTasksList] Loading completed tasks...');
  
  return (
    <CompletedTasksSection>
      {tasks.map(task => (
        <CompletedTaskItem key={task.id}>
          {task.name} - Completed in: {formatTime(task.completionTime || 0)}
        </CompletedTaskItem>
      ))}
    </CompletedTasksSection>
  );
};

export default CompletedTasksList; 