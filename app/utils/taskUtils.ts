import { Task } from '../types/Task';

export const excludedWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that','not']);
export const reservedWords = new Set(['id', 'name', 'attribute', 'externalDependency', 'effort', 'type', 'note', 'rejectionCount', 'isCompleted', 'completionTime','note','task','random']);

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
  if (task.externalDependency === 'no' || !task.externalDependency) priority += 1;
  
  // Attribute
  if (task.attribute === 'urgent') priority += 1;
  else if (task.attribute === 'important') priority += 2;

  // Parent Task
  if (task.parentTaskId) priority += 1;

  // ancilary fields
  if (task.note) priority += 1;
  if (task.url) priority += 1;

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
  const calibratedPriority = basePriority - rejectionPenalty;
  task.priorityScore = calibratedPriority;
  
  // normalize priority based on normal distribution based on ranking of priority
  const rank = tasks.findIndex(t => t.priorityScore === calibratedPriority);
  const normalizedPriority = (rank / (tasks.length - 1)) * priorityRange + minPriority;
  task.priorityScore = normalizedPriority;

  // Log statistics of rounded "normalizedPriority" instead of basePriority
  // console.log(`NormalizedPriority distribution from 0 to 7: ${
  //   Array.from({ length: 8 }, (_, i) => 
  //     `${i}: ${tasks.filter(t => Math.round(t.priorityScore || 0) === i).length}`
  //   ).join(', ')
  // }`);
  
  return Math.max(normalizedPriority, 0); // Ensure priority doesn't go below 0
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
  const maxLength = task.effort === 'large' ? 20 : task.effort === 'medium' ? 12 : 8;
  const truncatedName = task.name.length > maxLength ? task.name.slice(0, maxLength - 1) + '…' : task.name;
  return prefix + truncatedName;
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const selectTaskByMood = (mood: string, sortedTasks: Task[], tasks: Task[]): Task | undefined => {
  console.log('Mood selected:', mood);
  console.log('Available tasks:', sortedTasks);

  switch (mood) {
    case '💪':
      // select the most rejected task
      return sortedTasks.reduce((max: Task | undefined, task: Task) => 
        (max?.rejectionCount || 0) > task.rejectionCount ? max : task, undefined);
    case '🧘':
      // select the most priority task
      return sortedTasks.filter((task: Task) => task.type === 'happiness')
        .reduce((max: Task, task: Task) => 
           (task.priorityScore || 0) > (max.priorityScore || 0) ? task : max, sortedTasks[0]);
    case '🤓':
      // select the large effort task with the highest priority score
      const largeEffortTasks = sortedTasks.filter(task => task.effort === 'large');
      if (largeEffortTasks.length === 0) {
        console.log('No large effort tasks found');
        return undefined;
      }
      return largeEffortTasks.reduce((max, task) => 
        (task.priorityScore || 0) > (max.priorityScore || 0) ? task : max, largeEffortTasks[0]);
    case '🥱':
      // select the smallest effort task with no external dependency and no parent task
      const tasksNoDepSmallEffort = sortedTasks.filter((task: Task) => {
        return task.externalDependency === 'no' && task.effort === 'small' && !task.parentTaskId;
      });
      if (tasksNoDepSmallEffort.length === 0) {
        const mediumEffortTasks = sortedTasks.filter(task => 
          task.externalDependency === 'no' && task.effort === 'medium' && !task.parentTaskId);
        if (mediumEffortTasks.length > 0) return mediumEffortTasks[0];
        
        const largeEffortTasks = sortedTasks.filter(task => 
          task.externalDependency === 'no' && task.effort === 'large' && !task.parentTaskId);
        if (largeEffortTasks.length > 0) return largeEffortTasks[0];
      }
      return tasksNoDepSmallEffort.length > 0 ? tasksNoDepSmallEffort[0] : undefined;
    case '🤪': // Bored mood
      return sortedTasks[Math.floor(Math.random() * sortedTasks.length)];
    default:
      return undefined;
  }
};

export const generateRandomTasks = (count: number): Task[] => {
  const attributes = ['urgent', 'important', 'unimportant'] as const;
  const dependencies = ['yes', 'no'] as const;
  const efforts = ['small', 'medium', 'large'] as const;
  const types = ['debt', 'cost', 'revenue', 'happiness'] as const;

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Task ${i + 1}`,
    attribute: attributes[Math.floor(Math.random() * attributes.length)],
    externalDependency: dependencies[Math.floor(Math.random() * dependencies.length)],
    effort: efforts[Math.floor(Math.random() * efforts.length)],
    type: types[Math.floor(Math.random() * types.length)],
    note: `This is a random note for Task ${i + 1}`,
    rejectionCount: 0,
    isCompleted: false,
    createdAt: new Date().toISOString().split('T')[0],
    priorityScore: 0 // Initialize priorityScore
  }));
};
