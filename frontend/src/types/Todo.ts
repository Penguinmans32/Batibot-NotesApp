export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'overdue';
export type SortType = 'due_date' | 'priority' | 'created_at';