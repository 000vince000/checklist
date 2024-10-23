import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { formatTime } from '../utils/taskUtils';

interface TaskTimerProps {
  taskId: number;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ taskId }) => {
  const { updateTaskTimer, tasks } = useTaskContext();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          updateTaskTimer(taskId, newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, taskId, updateTaskTimer]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // Timer is being started
      updateTaskTimer(taskId, elapsedTime, true);
    } else {
      // Timer is being paused
      updateTaskTimer(taskId, elapsedTime, false);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    updateTaskTimer(taskId, elapsedTime, false, true);
  };

  return (
    <div>
      <div>{formatTime(elapsedTime)}</div>
      <button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};

export default TaskTimer;
