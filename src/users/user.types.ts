import { FastifyRequest } from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import { Timestamp } from 'firebase-admin/firestore';

// Request Types
export interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface> extends FastifyRequest<T> {
  user: { uid: string };
}

export interface UsernameParams {
  username: string;
}

export interface GetAllUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

// Domain Types
export interface User {
  uid: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: 'light' | 'dark';
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Response type for private profile (full details)
export interface UserProfileResponse {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  theme: 'light' | 'dark';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  links: Array<{
    id: string;
    title: string;
    url: string;
    imageUrl: string | null;
    order: number;
    active: boolean;
    clicks: number;
  }>;
}

// Response type for public profile (limited details)
export interface PublicProfileResponse {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  theme: 'light' | 'dark';
  links: Array<{
    id: string;
    title: string;
    url: string;
    imageUrl: string | null;
    order: number;
  }>;
}

// Response Types
export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserListItem {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  theme: 'light' | 'dark';
}

// DTO for updating user profile
export interface UpdateProfileInputParams {
  displayName?: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  theme?: 'light' | 'dark';
  isPublic?: boolean;
}

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'username'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      username: { 
        type: 'string', 
        pattern: '^[a-zA-Z0-9_]{3,15}$',
        description: 'Username must be 3-15 characters long and can only contain letters, numbers, and underscores'
      },
      bio: { 
        type: 'string', 
        maxLength: 160,
        description: 'Bio must be 160 characters or less'
      },
      picture: { 
        type: 'string', 
        format: 'uri',
        description: 'Picture must be a valid URL'
      }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        username: { type: 'string' },
        bio: { type: 'string', nullable: true },
        picture: { type: 'string', nullable: true },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        token: { type: 'string' }
      }
    }
  }
} as const; 