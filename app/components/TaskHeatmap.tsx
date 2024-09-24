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
  selectTaskByMood
} from '../utils/taskUtils';
import TaskModal from './TaskModal';
import { useTaskAnimation } from '../hooks/useTaskAnimation';

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  padding: 10px;
  border-radius: 8px;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  grid-auto-rows: minmax(40px, auto);
  grid-auto-flow: dense;
  gap: 5px;
  padding: 5px;
  justify-content: center;

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
  font-size: 10px;
  color: ${props => props.priority > 3.5 ? 'white' : 'black'};
  transition: transform 0.2s;
  padding: 5px;
  text-align: center;
  overflow: hidden;
  word-wrap: break-word;
  grid-column: span ${props => props.effort === 'l' ? 2 : 1};
  grid-row: span ${props => props.effort === 'l' ? 2 : props.effort === 'm' ? 2 : 1};

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

const LuckyButtonStyled = styled.button`
  background-color: transparent;
  border: 1px solid #FFA500;
  color: #FFA500;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #FFA500;
    color: white;
  }
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
  const { tasks, completedTasks, updateTask, completeTask, animatingTaskId } = useTaskContext();
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

  const openModal = (task: Task) => setSelectedTask(task);
  const closeModal = () => {
    setSelectedTask(null);
    setTimer(null);
    setTimerRunning(false);
    setIsPaused(false);
  };

  const handleAccept = () => {
    setTimer(0);
    setTimerRunning(true);
    setIsPaused(false);
  };

  const handleReject = () => {
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
    if (selectedTask && timer !== null) {
      completeTask(selectedTask.id, timer);
    }
    setTimerRunning(false);
    closeModal();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleAbandon = () => {
    handleReject();
  };

  const handleMoodSelection = (mood: string) => {
    console.log('Handling mood selection:', mood);
    console.log('All tasks:', tasks);
    console.log('Sorted tasks:', sortedTasks);
    const selectedTask = selectTaskByMood(mood, sortedTasks, tasks);
    console.log('Task selected by mood:', selectedTask);
    if (selectedTask) {
      openModal(selectedTask);
    } else {
      console.log('No task found for the selected mood');
    }
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
      handleMoodSelection(selectedMood);
      setSelectedMood(null);
    }
  }, [selectedMood]);

  const taskSpring = useTaskAnimation(animatingTaskId);

  return (
    <>
      <HeatmapContainer>
        <GridContainer>
          {sortedTasks.map(task => (
            <AnimatedTaskBox
              key={task.id}
              priority={calculatePriority(task, tasks)}
              effort={task.effort}
              onClick={() => openModal(task)}
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
        timer={timer}
        isPaused={isPaused}
        tasks={tasks}
      />
    </>
  );
};

interface LuckyButtonProps {
  openMoodModal: () => void;
}

export const LuckyButton: React.FC<LuckyButtonProps> = ({ openMoodModal }) => {
  return <LuckyButtonStyled onClick={openMoodModal}>Feeling Lucky</LuckyButtonStyled>;
};

export default TaskHeatmap;