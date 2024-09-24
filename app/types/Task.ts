export interface Task {
  id: number;
  name: string;
  attribute: 'urgent' | 'important' | 'unimportant';
  externalDependency: 'yes' | 'no';
  effort: 'small' | 'medium' | 'large';
  type: 'debt' | 'cost' | 'revenue' | 'happiness';
  note?: string;
  rejectionCount: number;
  isCompleted: boolean;
  completionTime?: number;
  parentTaskId?: number | null; // Add this new field
}