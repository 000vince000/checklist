import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { AnimatedTaskItem } from '../styles/TaskStyles';

const TaskList: React.FC = () => {
  const { tasks, animatingTaskId } = useTaskContext();

  return (
    <div>
      {tasks.map(task => (
        <AnimatedTaskItem key={task.id} isAnimating={task.id === animatingTaskId}>
          {/* Your existing task item content */}
        </AnimatedTaskItem>
      ))}
    </div>
  );
};

export default TaskList;