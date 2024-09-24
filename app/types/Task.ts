export interface Task {
  id: number;
  name: string;
  attribute: 'urgent' | 'important' | 'unimportant';
  externalDependency: 'yes' | 'no';
  effort: 'large' | 'medium' | 'small';
  type: 'debt' | 'cost' | 'revenue' | 'happiness';
  note?: string;
  rejectionCount: number;
  completionTime?: number;
  isCompleted: boolean;
  isAnimating?: boolean;
}