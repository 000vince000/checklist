import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { animated } from 'react-spring';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/Task';
import {
  getPriorityColor,
  calculatePriority,
  truncateName,
  formatTime,
  selectTaskByMood,
  getTaskPrefix // Add this import
} from '../utils/taskUtils';
import TaskModal from './TaskModal';
import { useTaskAnimation } from '../hooks/useTaskAnimation';

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  padding: 0px;
  margin: -20px;
  border-radius: 8px;

  @media (min-width: 768px) {
    padding: 10px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  grid-auto-rows: minmax(40px, auto);
  grid-auto-flow: dense;
  gap: 5px;
  padding: 0;
  margin: 0;
  justify-content: center;
  overflow: hidden;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 10px;
    padding: 10px;
  }
`;

const TaskBox = styled.div<{ priority: number; effort: Task['effort'] }>`
  border-radius: 4px;
  background-color: ${props => getPriorityColor(props.priority)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${props => props.priority > 3.5 ? 'white' : 'black'};
  transition: transform 0.2s;
  padding: 2px; // Reduced from 3px
  margin: 0; // Ensure no margin
  text-align: center;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  grid-column: span ${props => props.effort === 'large' ? 1 : props.effort === 'medium' ? 2 : 3};
  grid-row: span ${props => props.effort === 'large' ? 1 : props.effort === 'medium' ? 2 : 3};

  @media (min-width: 768px) {
    font-size: 12px;
    padding: 10px;
  }

  &:hover {
    transform: scale(1.05);
    z-index: 1;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 5px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  background-color: ${props => props.color};
`;

const LegendSize = styled.div<{ size: string }>`
  width: ${props => props.size};
  height: ${props => props.size};
  margin-right: 5px;
  border: 1px solid white;
`;

const CompletedTasksSection = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #3c3c3c;
  border-radius: 8px;
`;

const CompletedTaskItem = styled.div`
  padding: 5px;
  margin: 5px 0;
  background-color: #4a4a4a;
  border-radius: 4px;
`;

interface TaskHeatmapProps {
  selectedMood: string | null;
  setSelectedMood: React.Dispatch<React.SetStateAction<string | null>>;
  searchTerm: string;
  attributeFilter: string;
  typeFilter: string;
}

const AnimatedTaskBox = animated(TaskBox);

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

  const handleMoodSelection = (mood: string) => {
    console.log('Handling mood selection:', mood);
    console.log('All tasks:', tasks);
    console.log('Sorted tasks:', sortedTasks);
    const selectedTask = selectTaskByMood(mood, sortedTasks, tasks);
    console.log('Task selected by mood:', selectedTask);
    if (selectedTask) {
      openModal(selectedTask.id);
    } else {
      console.log('No task found for the selected mood');
    }
  };

  const taskSpring = useTaskAnimation(animatingTaskId);

  const truncateName = (task: Task) => {
    const prefix = getTaskPrefix(task.type);
    const maxLength = task.effort === 'large' ? 20 : task.effort === 'medium' ? 80 : 120;
    return prefix + task.name.slice(0, maxLength);
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
      <CompletedTasksSection>
        <h3>Completed Tasks</h3>
        {completedTasks.map(task => (
          <CompletedTaskItem key={task.id}>
            {task.name} - Completed in: {formatTime(task.completionTime || 0)}
          </CompletedTaskItem>
        ))}
      </CompletedTasksSection>
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
