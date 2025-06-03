import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const MOVEMENT_THRESHOLD = 5; // pixels

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const taskSpring = useTaskAnimation(animatingTaskId);

  const truncateTaskName = (task: Task) => {
    const prefix = getTaskPrefix(task.type);
    const gridSize = getGridDimensions(task.effort, calculatePriority(task, tasks)).columns;
    const maxLength = gridSize === 4 ? 80 : gridSize === 3 ? 60 : gridSize === 2 ? 20 : 15;
    return prefix + " " + task.name.slice(0, maxLength);
  };

  const handleTaskHover = (task: Task, event: React.MouseEvent) => {
    if (isMobile) return; // Skip hover on mobile
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + (rect.width / 2), 
      y: rect.top - 10 
    });
    setTooltipTask(task);
  };

  const handleTaskLeave = () => {
    if (isMobile) return; // Skip hover leave on mobile
    setTooltipTask(null);
  };

  const handlePointerDown = (task: Task, event: React.PointerEvent) => {
    console.log('PointerDown:', { 
      type: event.pointerType,
      isTouch: event.pointerType === 'touch',
      taskId: task.id 
    });

    if (event.pointerType !== 'touch') return;
    
    // Store initial touch position
    touchStartPos.current = {
      x: event.clientX,
      y: event.clientY
    };
    
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    console.log('Starting long press timer');
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      console.log('Long press timer completed');
      setTooltipPosition({ 
        x: rect.left + (rect.width / 2), 
        y: rect.top - 10 
      });
      setTooltipTask(task);
    }, 500);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    console.log('PointerUp:', { 
      type: event.pointerType,
      isTouch: event.pointerType === 'touch',
      hasTimer: !!longPressTimer.current 
    });

    if (event.pointerType !== 'touch') return;
    if (longPressTimer.current) {
      console.log('Clearing long press timer');
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
    setIsLongPressing(false);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch' || !touchStartPos.current) return;

    const movement = Math.sqrt(
      Math.pow(event.clientX - touchStartPos.current.x, 2) +
      Math.pow(event.clientY - touchStartPos.current.y, 2)
    );

    console.log('PointerMove:', {
      movement,
      threshold: MOVEMENT_THRESHOLD,
      hasTimer: !!longPressTimer.current
    });

    if (movement > MOVEMENT_THRESHOLD && longPressTimer.current) {
      console.log('Movement exceeded threshold, clearing timer');
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      setTooltipTask(null);
      setIsLongPressing(false);
    }
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
              onPointerDown={(e) => handlePointerDown(task, e)}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              style={{
                ...task.id === animatingTaskId ? taskSpring : undefined,
                // update color if old use slightly darker grey color 
                backgroundColor: isTaskOld(task) ? '#808080' : getPriorityColor(calculatePriority(task, tasks)),
                userSelect: isLongPressing ? 'none' : 'auto'
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
