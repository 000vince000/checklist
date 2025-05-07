import React, { useState, useEffect, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useModalContext } from '../context/ModalContext';
import { Task } from '../types/Task';
import {
  getPriorityColor,
  calculatePriority,
  truncateName,
  formatTime,
  selectTaskByMood,
  getTaskPrefix,
  isTaskOld
} from '../utils/taskUtils';
import { useTaskAnimation } from '../hooks/useTaskAnimation';
import {
  HeatmapContainer,
  GridContainer,
  AnimatedTaskBox,
  Legend,
  LegendItem,
  LegendColor,
  getGridDimensions,
  Tooltip
} from '../styles/TaskHeatmapStyles';

// Add this interface definition
interface TaskHeatmapProps {
  selectedMood: string | null;
  setSelectedMood: React.Dispatch<React.SetStateAction<string | null>>;
  searchTerm: string;
  attributeFilter: string;
  typeFilter: string;
}

const TaskHeatmap: React.FC<TaskHeatmapProps> = ({ 
  selectedMood, 
  setSelectedMood, 
  searchTerm, 
  attributeFilter, 
  typeFilter
}) => {
  const { 
    tasks, 
    wipTasks,
    animatingTaskId, 
    customTypes
  } = useTaskContext();
  
  const { openModal } = useModalContext();

  const [tooltipTask, setTooltipTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
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
  }, [tasks, searchTerm, attributeFilter, typeFilter]);

  const sortedTasks = useMemo(() => {
    return filteredTasks.sort((a, b) => calculatePriority(b, tasks) - calculatePriority(a, tasks));
  }, [filteredTasks, tasks]);

  useEffect(() => {
    if (selectedMood) {
      const selectedTask = selectTaskByMood(selectedMood, sortedTasks, tasks);
      if (selectedTask) {
        openModal(selectedTask.id, tasks, wipTasks);
      }
      setSelectedMood(null); // Reset the mood after selection
    }
  }, [selectedMood, sortedTasks, tasks, customTypes, wipTasks, openModal]);

  const taskSpring = useTaskAnimation(animatingTaskId);

  const truncateTaskName = (task: Task) => {
    const prefix = getTaskPrefix(task.type);
    const gridSize = getGridDimensions(task.effort, calculatePriority(task, tasks)).columns;
    const maxLength = gridSize === 4 ? 80 : gridSize === 3 ? 60 : gridSize === 2 ? 20 : 15;
    return prefix + " " + task.name.slice(0, maxLength);
  };

  const handleTaskHover = (task: Task, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + (rect.width / 2), 
      y: rect.top - 10 
    });
    setTooltipTask(task);
  };

  const handleTaskLeave = () => {
    setTooltipTask(null);
  };

  return (
    <>
      {/* Heatmap Container */}
      <HeatmapContainer>
        <GridContainer>
          {sortedTasks.map(task => (
            <AnimatedTaskBox
              key={task.id}
              priority={calculatePriority(task, tasks)}
              effort={task.effort}
              onClick={() => openModal(task.id, tasks, wipTasks)}
              onMouseEnter={(e) => handleTaskHover(task, e)}
              onMouseLeave={handleTaskLeave}
              style={{
                ...task.id === animatingTaskId ? taskSpring : undefined,
                // update color if old use slightly darker grey color 
                backgroundColor: isTaskOld(task) ? '#808080' : getPriorityColor(calculatePriority(task, tasks))
              }}
            >
              {truncateTaskName(task)}
            </AnimatedTaskBox>
          ))}
        </GridContainer>
        <Legend>
          <LegendItem>
            <LegendColor color="#808080" />
            <span>Stale</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color={getPriorityColor(0)} />
            <span>Low Priority</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color={getPriorityColor(3.5)} />
            <span>Medium Priority</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color={getPriorityColor(7)} />
            <span>High Priority</span>
          </LegendItem>
        </Legend>
      </HeatmapContainer>
      {tooltipTask && (
        <Tooltip style={{ 
          left: tooltipPosition.x, 
          top: tooltipPosition.y,
          transform: 'translateX(-50%)'  // Center the tooltip
        }}>
          {tooltipTask.name}
        </Tooltip>
      )}
    </>
  );
};

export default TaskHeatmap;
