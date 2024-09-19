import React, { useState } from 'react';
import TaskInput from './TaskInput';
import TaskHeatmap from './TaskHeatmap';
import TaskSuggestion from './TaskSuggestion';

interface Task {
  id: string;
  name: string;
  attribute: 'urgent' | 'important' | 'unimportant';
  externalDependency: boolean;
  effort: 'l' | 'm' | 'h';
  type: 'debt' | 'cost' | 'revenue' | 'happiness';
  note: string;
  rejectCount: number;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (newTask: Omit<Task, 'id' | 'rejectCount'>) => {
    setTasks([...tasks, { ...newTask, id: Date.now().toString(), rejectCount: 0 }]);
  };

  return (
    <div className="App">
      <h1>Collaborative Checklist</h1>
      <TaskInput onAddTask={addTask} />
      <TaskHeatmap tasks={tasks} />
      <TaskSuggestion tasks={tasks} setTasks={setTasks} />
    </div>
  );
}

export default App;