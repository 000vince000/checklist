export interface Task {
  id: number;
  name: string;
  attribute: 'urgent' | 'important' | 'unimportant';
  externalDependency: 'yes' | 'no';
  effort: 'small' | 'medium' | 'large';
  type: 'debt' | 'cost' | 'revenue' | 'happiness' | string; // Allow custom string types
  note?: string;
  rejectionCount: number;
  isCompleted: boolean;
  completionTime?: number;
  parentTaskId?: number | null; // Add this new field
  isRunning?: boolean;  // Add this line
  createdAt?: string; // Add this line
  updatedAt?: string; // Add this line
  completedAt?: string; // Add this line
  url?: string;
}

// Add a new interface for custom types
export interface CustomTaskType {
  name: string;
  emoji: string;
}
