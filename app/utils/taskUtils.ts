import { Task } from '../types/Task';

export const excludedWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that','not']);
export const reservedWords = new Set(['id', 'name', 'attribute', 'externalDependency', 'effort', 'type', 'note', 'rejectionCount', 'isCompleted', 'completionTime','note','task','random']);

export const getPriorityColor = (priority: number) => {
  const hue = Math.max(0, Math.min(120 - priority * 20, 120)); // 120 is green, 0 is red
  return `hsl(${hue}, 100%, 50%)`;
};

export const calculateBasePriority = (task: Task) => {
  let priority = 0;
  
  // calculate priority based on type, per taskTypes in local storage, where priority is the length of the array minus the index of the type
  const customTypes = JSON.parse(localStorage.getItem('taskTypes') || '[]');
  const typeIndex = customTypes.findIndex(t => t.name.toLowerCase() === task.type);
  if (typeIndex !== -1) priority += ((customTypes.length - 1) - typeIndex);
  
  // External Dependency
  if (task.externalDependency === 'no') priority += 1;
  
  // Attribute
  // increment by 1/2 of size of type array; justification: importance should scale with number of types
  if (task.attribute === 'important') priority += (customTypes.length / 2);
  else if (task.attribute === 'unimportant') priority -= (customTypes.length / 2);

  // Parent Task
  if (task.parentTaskId) priority += 1;

  // ancilary fields
  if (task.note) priority += 1;
  if (task.url) priority += 1;

  return priority;
};

export const calculatePriority = (task: Task, tasks: Task[]) => {
  //check if a task is old, if so, set priority to 0
  if (isTaskOld(task)) return 0;

  const basePriority = calculateBasePriority(task);
  
  // Calculate the range of priorities
  const priorities = tasks.map(t => calculateBasePriority(t));
  const maxPriority = Math.max(...priorities);
  const minPriority = Math.min(...priorities);
  const priorityRange = maxPriority - minPriority;

  // Subtract rejection penalty
  const rejectionPenalty = (task.rejectionCount * 0.1 * priorityRange);
  const calibratedPriority = basePriority - rejectionPenalty;
  
  return Math.max(calibratedPriority, 0); // Ensure priority doesn't go below 0
};

export const getTaskPrefix = (type: Task['type']) => {
  // look up the custom type in the local storage, where the prefix is the emoji
  const customTypes = JSON.parse(localStorage.getItem('taskTypes') || '[]');
  const customType = customTypes.find(t => t.name.toLowerCase() === type);
  if (customType) return customType.emoji;
  else return '❓';
};

export const truncateName = (task: Task) => {
  const prefix = getTaskPrefix(task.type);
  const maxLength = task.effort === 'large' ? 20 : task.effort === 'medium' ? 12 : 8;
  const truncatedName = task.name.length > maxLength ? task.name.slice(0, maxLength - 1) + '…' : task.name;
  return prefix + " " + truncatedName;
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
          calculatePriority(task, tasks) > calculatePriority(max, tasks) ? task : max, sortedTasks[0]);
    case '🤓':
      // select the most priority large effort task
      return sortedTasks.reduce((max: Task, task: Task) => 
        (task.effort === 'large' && calculatePriority(task, tasks) > calculatePriority(max, tasks)) ? task : max, sortedTasks[0]);
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
    createdAt: new Date().toISOString().split('T')[0] // Add this line
  }));
};

export const isTaskOld = (task: Task): boolean => {
  // Use updatedAt if available, otherwise fall back to createdAt
  const dateToCheck = task.updatedAt || task.createdAt;
  if (!dateToCheck) return false;
  
  const taskDate = new Date(dateToCheck);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - taskDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 45;
};