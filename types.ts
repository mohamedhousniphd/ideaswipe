export enum IdeaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string; // Added for auth
  password?: string; // Added for auth (mock storage)
  role: UserRole;
  createdAt: number;
}

export interface Idea {
  id: string;
  authorId: string;
  content: string;
  status: IdeaStatus;
  createdAt: number;
  likes: number;
  dislikes: number;
  rejectionReason?: string;
}

export interface Interaction {
  userId: string;
  ideaId: string;
  type: 'like' | 'dislike';
  timestamp: number;
}

export interface AppConfig {
  openRouterApiKey: string;
  maxIdeasPerUser: number;
}
