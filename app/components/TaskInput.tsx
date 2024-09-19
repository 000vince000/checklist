import React, { useState } from 'react';

interface TaskInputProps {
  onAddTask: (task: any) => void;
}

function TaskInput({ onAddTask }: TaskInputProps) {
  const [taskName, setTaskName] = useState('');
  const [attribute, setAttribute] = useState<'urgent' | 'important' | 'unimportant'>('important');
  const [externalDependency, setExternalDependency] = useState(false);
  const [effort, setEffort] = useState<'l' | 'm' | 'h'>('m');
  const [type, setType] = useState<'debt' | 'cost' | 'revenue' | 'happiness'>('debt');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({ name: taskName, attribute, externalDependency, effort, type, note });
    // Reset form
    setTaskName('');
    setAttribute('important');
    setExternalDependency(false);
    setEffort('m');
    setType('debt');
    setNote('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task name"
        required
      />
      {/* Add more form fields for other task properties */}
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskInput;