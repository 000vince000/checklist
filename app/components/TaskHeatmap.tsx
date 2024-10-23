import React, { useState, useEffect, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/Task';
import {
  getPriorityColor,
  calculatePriority,
  truncateName,
  formatTime,
  selectTaskByMood,
  getTaskPrefix
} from '../utils/taskUtils';
import TaskModal from './TaskModal';
import { useTaskAnimation } from '../hooks/useTaskAnimation';
import {
  HeatmapContainer,
  GridContainer,
  AnimatedTaskBox,
  Legend,
  LegendItem,
  LegendColor,
  getGridDimensions
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
  const { tasks, completedTasks, updateTask, completeTask, deleteTask, animatingTaskId } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, forceUpdate] = useState({});

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

  const openModal = (taskId: number) => {
    console.log('TaskHeatmap: Opening modal for task id', taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    } else {
      console.log('Task not found for id:', taskId);
    }
  };

  const closeModal = () => {
    console.log('TaskHeatmap: Closing modal');
    setSelectedTask(null);
    setTimer(null);
    setTimerRunning(false);
    setIsPaused(false);
  };

  const handleAccept = () => {
    console.log('TaskHeatmap: Accepting task', selectedTask);
    if (selectedTask) {
      setTimer(0);
      setTimerRunning(true);
      setIsPaused(false);
    }
  };

  const handleReject = () => {
    console.log('TaskHeatmap: Rejecting task', selectedTask);
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        rejectionCount: (selectedTask.rejectionCount || 0) + 1
      };
      updateTask(updatedTask);
      setSelectedTask(updatedTask);
      forceUpdate({}); // Force a re-render
    }
    closeModal();
  };

  const handleDone = () => {
    console.log('TaskHeatmap: Completing task', selectedTask);
    if (selectedTask && timer !== null) {
      completeTask(selectedTask.id, timer);
    }
    setTimerRunning(false);
    closeModal();
  };

  const handlePause = () => {
    console.log('TaskHeatmap: Pausing/Resuming task', selectedTask);
    setIsPaused(!isPaused);
  };

  const handleAbandon = () => {
    console.log('TaskHeatmap: Abandoning task', selectedTask);
    handleReject();
  };

  const handleDelete = () => {
    console.log('TaskHeatmap: Deleting task', selectedTask);
    if (selectedTask) {
      deleteTask(selectedTask.id);
      closeModal();
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    console.log('TaskHeatmap: Updating task', updatedTask);
    updateTask(updatedTask);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && !isPaused) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer !== null ? prevTimer + 1 : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isPaused]);

  useEffect(() => {
    if (selectedMood) {
      const selectedTask = selectTaskByMood(selectedMood, sortedTasks, tasks);
      if (selectedTask) {
        openModal(selectedTask.id);
      }
      setSelectedMood(null); // Reset the mood after selection
    }
  }, [selectedMood, sortedTasks, tasks]);

  const taskSpring = useTaskAnimation(animatingTaskId);

  const truncateName = (task: Task) => {
    const prefix = getTaskPrefix(task.type);
    const gridSize = getGridDimensions(task.effort, calculatePriority(task, tasks)).columns;
    //const maxLength = task.effort === 'large' ? 20 : task.effort === 'medium' ? 80 : 120;
    const maxLength = gridSize === 4 ? 80 : gridSize === 3 ? 60 : gridSize === 2 ? 20 : 15;
    return prefix + " " + task.name.slice(0, maxLength);
  };

  // Add this new function to update the selected task
  const updateSelectedTask = (task: Task) => {
    console.log('TaskHeatmap: Updating selected task', task);
    setSelectedTask(task);
  };

  return (
    <>
      <HeatmapContainer>
        <GridContainer>
          {sortedTasks.map(task => (
            <AnimatedTaskBox
              key={task.id}
              priority={calculatePriority(task, tasks)}
              effort={task.effort}
              onClick={() => openModal(task.id)}
              style={task.id === animatingTaskId ? taskSpring : undefined}
            >
              {truncateName(task)}
            </AnimatedTaskBox>
          ))}
        </GridContainer>
        <Legend>
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
      <TaskModal
        selectedTask={selectedTask}
        isOpen={selectedTask !== null}
        closeModal={closeModal}
        handleAccept={handleAccept}
        handleReject={handleReject}
        handleDone={handleDone}
        handlePause={handlePause}
        handleAbandon={handleAbandon}
        handleDelete={handleDelete}
        handleUpdateTask={handleUpdateTask}
        timer={timer}
        isPaused={isPaused}
        tasks={tasks}
        openTaskModal={openModal}
        updateSelectedTask={updateSelectedTask}
      />
    </>
  );
};

export default TaskHeatmap;
