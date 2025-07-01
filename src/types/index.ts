
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  starred: boolean;
}
export interface QuoteHubApiResponse {
  quote: string; 
  author: string;
  category?: string;
}
