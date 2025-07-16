import { Timestamp } from 'firebase-admin/firestore';

export interface Link {
  id: string;
  userId: string;
  title: string;
  url: string;
  order: number;
  imageUrl?: string;
  active: boolean;
  clicks: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateLinkDto {
  title: string;
  url: string;
  order?: number;
  imageUrl?: string;
}

export interface LinkResponse {
  id: string;
  title: string;
  url: string;
  order: number;
  imageUrl?: string;
  active: boolean;
  clicks: number;
  createdAt: string;  // ISO string for API responses
  updatedAt: string;
} 