import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/Task';

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

const getPriorityColor = (priority: number) => {
  const hue = Math.max(0, Math.min(120 - priority * 20, 120)); // 120 is green, 0 is red
  return `hsl(${hue}, 100%, 50%)`;
};

const calculateBasePriority = (task: Task) => {
  let priority = 0;
  
  // Type
  if (task.type === 'cost') priority += 1;
  else if (task.type === 'revenue') priority += 2;
  else if (task.type === 'happiness') priority += 3;
  
  // External Dependency
  if (task.externalDependency === 'no') priority += 2;
  
  // Attribute
  if (task.attribute === 'urgent') priority += 1;
  else if (task.attribute === 'important') priority += 2;

  return priority;
};

const calculatePriority = (task: Task, tasks: Task[]) => {
  const basePriority = calculateBasePriority(task);
  
  // Calculate the range of priorities
  const priorities = tasks.map(t => calculateBasePriority(t));
  const maxPriority = Math.max(...priorities);
  const minPriority = Math.min(...priorities);
  const priorityRange = maxPriority - minPriority;

  // Subtract rejection penalty
  const rejectionPenalty = (task.rejectionCount * 0.1 * priorityRange);
  
  return Math.max(basePriority - rejectionPenalty, 0); // Ensure priority doesn't go below 0
};

const TaskHeatmap: React.FC = () => {
  const { tasks, updateTask, completeTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, forceUpdate] = useState({});

  const openModal = (task: Task) => setSelectedTask(task);
  const closeModal = () => {
    setSelectedTask(null);
    setTimer(null);
    setTimerRunning(false);
    setIsPaused(false);
  };

  const truncateName = (name: string, effort: Task['effort']) => {
    const maxLength = effort === 'h' ? 8 : effort === 'm' ? 12 : 16;
    return name.length > maxLength ? name.slice(0, maxLength - 3) + '...' : name;
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && !isPaused) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer !== null ? prevTimer + 1 : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedTasks = React.useMemo(() => {
    return tasks
      .filter(task => !task.isCompleted)
      .sort((a, b) => calculatePriority(b, tasks) - calculatePriority(a, tasks));
  }, [tasks]);

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
              {truncateName(task.name, task.effort)}
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

export default TaskHeatmap;