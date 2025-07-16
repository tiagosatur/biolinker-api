import { FastifyRequest, RouteGenericInterface } from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      uid: string;
    };
  }
} 