import React, { useState } from 'react';

interface TaskSuggestionProps {
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
}

function TaskSuggestion({ tasks, setTasks }: TaskSuggestionProps) {
  const [suggestedTask, setSuggestedTask] = useState<any | null>(null);

  const suggestTask = () => {
    // TODO: Implement task suggestion algorithm
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    setSuggestedTask(randomTask);
  };

  const acceptTask = () => {
    // TODO: Implement timer functionality
    console.log('Task accepted:', suggestedTask);
    setSuggestedTask(null);
  };

  const rejectTask = () => {
    if (suggestedTask) {
      setTasks(tasks.map(task => 
        task.id === suggestedTask.id 
          ? { ...task, rejectCount: (task.rejectCount || 0) + 1 }
          : task
      ));
    }
    suggestTask(); // Suggest a new task
  };

  return (
    <div>
      <button onClick={suggestTask}>Give me a task to work on</button>
      {suggestedTask && (
        <div>
          <h3>Suggested Task: {suggestedTask.name}</h3>
          <button onClick={acceptTask}>Accept</button>
          <button onClick={rejectTask}>Reject</button>
        </div>
      )}
    </div>
  );
}

export default TaskSuggestion;