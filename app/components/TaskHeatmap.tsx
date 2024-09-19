import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/Task';
import {
  getPriorityColor,
  calculatePriority,
  truncateName,
  formatTime,
  selectTaskByMood
} from '../utils/taskUtils';

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
`;

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
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
  width: ${props => props.effort === 'h' ? '60px' : props.effort === 'm' ? '80px' : '100px'};
  height: ${props => props.effort === 'h' ? '60px' : props.effort === 'm' ? '80px' : '100px'};
  padding: 5px;
  text-align: center;
  overflow: hidden;
  word-wrap: break-word;

  &:hover {
    transform: scale(1.1);
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

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
  background-color: #3c3c3c;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  color: white;
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;

  &:hover,
  &:focus {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
  }
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  color: white;
`;

const AcceptButton = styled(ModalButton)`
  background-color: #4CAF50;
`;

const RejectButton = styled(ModalButton)`
  background-color: #f44336;
`;

const DoneButton = styled(ModalButton)`
  background-color: #2196F3;
`;

const Timer = styled.div`
  font-size: 24px;
  margin: 20px 0;
`;

const PauseButton = styled(ModalButton)`
  background-color: #FFA500;
`;

const AbandonButton = styled(ModalButton)`
  background-color: #8B0000;
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

const MoodModal = styled(Modal)``;

const MoodModalContent = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MoodButton = styled.button`
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

interface TaskHeatmapProps {
  selectedMood: string | null;
  setSelectedMood: React.Dispatch<React.SetStateAction<string | null>>;
}

const TaskHeatmap: React.FC<TaskHeatmapProps> = ({ selectedMood, setSelectedMood }) => {
  const { tasks, completedTasks, updateTask, completeTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, forceUpdate] = useState({});

  const sortedTasks = useMemo(() => {
    return tasks
      .filter(task => !task.isCompleted)
      .sort((a, b) => calculatePriority(b, tasks) - calculatePriority(a, tasks));
  }, [tasks]);

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
    const selectedTask = selectTaskByMood(mood, sortedTasks, tasks);
    if (selectedTask) {
      openModal(selectedTask);
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

  return (
    <>
      <HeatmapContainer>
        <GridContainer>
          {sortedTasks.map(task => (
            <TaskBox
              key={task.id}
              priority={calculatePriority(task, tasks)}
              effort={task.effort}
              onClick={() => openModal(task)}
            >
              {truncateName(task)}
            </TaskBox>
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
          <LegendItem>
            <LegendSize size="100px" />
            <span>Low Effort</span>
          </LegendItem>
          <LegendItem>
            <LegendSize size="80px" />
            <span>Medium Effort</span>
          </LegendItem>
          <LegendItem>
            <LegendSize size="60px" />
            <span>High Effort</span>
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
      <Modal isOpen={selectedTask !== null}>
        <ModalContent>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
          {selectedTask && (
            <div>
              <h2>{selectedTask.name}</h2>
              <p>Attribute: {selectedTask.attribute}</p>
              <p>External Dependency: {selectedTask.externalDependency}</p>
              <p>Effort: {selectedTask.effort}</p>
              <p>Type: {selectedTask.type}</p>
              <p>Note: {selectedTask.note}</p>
              <p>Priority Score: {calculatePriority(selectedTask, tasks).toFixed(2)}</p>
              <p>Rejection Count: {selectedTask.rejectionCount}</p>
              {timer === null ? (
                <>
                  <AcceptButton onClick={handleAccept}>Accept Challenge</AcceptButton>
                  <RejectButton onClick={handleReject}>Reject</RejectButton>
                </>
              ) : (
                <>
                  <Timer>{formatTime(timer)}</Timer>
                  <DoneButton onClick={handleDone}>Done</DoneButton>
                  <PauseButton onClick={handlePause}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </PauseButton>
                  <AbandonButton onClick={handleAbandon}>Abandon</AbandonButton>
                </>
              )}
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

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

interface LuckyButtonProps {
  openMoodModal: () => void;
}

export const LuckyButton: React.FC<LuckyButtonProps> = ({ openMoodModal }) => {
  return <LuckyButtonStyled onClick={openMoodModal}>I'm Feeling Lucky</LuckyButtonStyled>;
};

export default TaskHeatmap;