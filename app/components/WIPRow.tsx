import React, { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useModalContext } from '../context/ModalContext';
import { Task } from '../types/Task';
import {
  getPriorityColor,
  calculatePriority,
  getTaskPrefix,
  isTaskOld
} from '../utils/taskUtils';
import { useTaskAnimation } from '../hooks/useTaskAnimation';
import {
  WIPRowContainer,
  WIPHeader,
  WIPTaskBox
} from '../styles/TaskHeatmapStyles';

interface WIPRowProps {
  searchTerm: string;
  attributeFilter: string;
  typeFilter: string;
}

const WIPRow: React.FC<WIPRowProps> = ({ 
  searchTerm, 
  attributeFilter, 
  typeFilter
}) => {
  const { 
    tasks, 
    wipTasks, 
    animatingTaskId
  } = useTaskContext();

  const { openModal } = useModalContext();

  const filteredWipTasks = useMemo(() => {
    return wipTasks.filter(task => 
      !task.isCompleted && 
      (task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.attribute.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.externalDependency.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.effort.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (attributeFilter === 'all' || task.attribute === attributeFilter) &&
      (typeFilter === 'all' || task.type === typeFilter)
    );
  }, [wipTasks, searchTerm, attributeFilter, typeFilter]);

  const taskSpring = useTaskAnimation(animatingTaskId);

  const truncateTaskName = (task: Task) => {
    const prefix = getTaskPrefix(task.type);
    const maxLength = 80; // Simplified for WIP tasks
    return prefix + " " + task.name.slice(0, maxLength);
  };

  if (filteredWipTasks.length === 0) {
    return null;
  }

  return (
    <div>
      <WIPHeader>In Progress</WIPHeader>
      <WIPRowContainer>
        {filteredWipTasks.map(task => (
          <WIPTaskBox
            key={task.id}
            priority={calculatePriority(task, tasks)}
            effort={task.effort}
            onClick={() => openModal(task.id, tasks, wipTasks)}
            style={{
              ...task.id === animatingTaskId ? taskSpring : undefined,
              backgroundColor: isTaskOld(task) ? '#808080' : getPriorityColor(calculatePriority(task, tasks))
            }}
          >
            {truncateTaskName(task)}
          </WIPTaskBox>
        ))}
      </WIPRowContainer>
    </div>
  );
};

export default WIPRow; 