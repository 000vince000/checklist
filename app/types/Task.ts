export interface Task {
  id: number;
  name: string;
  attribute: 'urgent' | 'important' | 'unimportant';
  externalDependency: 'yes' | 'no';
  effort: 'l' | 'm' | 'h';
  type: 'debt' | 'cost' | 'revenue' | 'happiness';
  note?: string;
  rejectionCount: number;
  completionTime?: number;
  isCompleted: boolean;
  isAnimating?: boolean;
}