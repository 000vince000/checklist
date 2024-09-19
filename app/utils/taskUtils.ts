import { Task } from '../types/Task';

export const getPriorityColor = (priority: number) => {
  const hue = Math.max(0, Math.min(120 - priority * 20, 120)); // 120 is green, 0 is red
  return `hsl(${hue}, 100%, 50%)`;
};

export const calculateBasePriority = (task: Task) => {
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

export const calculatePriority = (task: Task, tasks: Task[]) => {
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

export const getTaskPrefix = (type: Task['type']) => {
  switch (type) {
    case 'happiness': return '❤️ ';
    case 'revenue': return '💰 ';
    case 'cost': return '💸 ';
    case 'debt': return '👻 ';
    default: return '';
  }
};

export const truncateName = (task: Task) => {
  const prefix = getTaskPrefix(task.type);
  const maxLength = task.effort === 'h' ? 6 : task.effort === 'm' ? 10 : 14;
  const truncatedName = task.name.length > maxLength ? task.name.slice(0, maxLength - 1) + '…' : task.name;
  return prefix + truncatedName;
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const selectTaskByMood = (mood: string, sortedTasks: Task[], tasks: Task[]): Task | undefined => {
  switch (mood) {
    case '💪':
      return sortedTasks.reduce((max: Task | undefined, task: Task) => 
        (max?.rejectionCount || 0) > task.rejectionCount ? max : task, undefined);
    case '🧘':
      return sortedTasks.filter((task: Task) => task.type === 'happiness')
        .reduce((max: Task, task: Task) => 
          calculatePriority(task, tasks) > calculatePriority(max, tasks) ? task : max, sortedTasks[0]);
    case '🤓':
      return sortedTasks.reduce((max: Task, task: Task) => 
        (task.effort === 'h' && calculatePriority(task, tasks) > calculatePriority(max, tasks)) ? task : max, sortedTasks[0]);
    case '🥱':
      return sortedTasks.filter((task: Task) => task.type === 'debt' && task.externalDependency === 'no' && task.effort === 'l')[0];
    case '🤪':
      return sortedTasks[Math.floor(Math.random() * sortedTasks.length)];
    default:
      return undefined;
  }
};