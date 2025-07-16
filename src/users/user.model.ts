import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  uid: string;
  username: string;
  bio?: string;
  picture?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUser {
  email: string;
  password: string;
  username: string;
  bio?: string;
  picture?: string;
}

export interface UserResponse {
  uid: string;
  username: string;
  bio?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
  token: string;
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