import { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { AuthController } from './auth.controller';
import { authenticate } from '../shared/middleware/auth.middleware';
import { authSchemas } from './auth.schemas';

export async function authRoutes(fastify: FastifyInstance, controller: AuthController) {
  // Register new user
  fastify.post('/auth/register', {
    schema: authSchemas.register
  }, controller.register.bind(controller) as RouteHandlerMethod);

  // Login user
  fastify.post('/auth/login', {
    schema: authSchemas.login
  }, controller.login.bind(controller) as RouteHandlerMethod);

  // Refresh access token
  fastify.post('/auth/refresh', {
    schema: authSchemas.refresh
  }, controller.refreshToken.bind(controller) as RouteHandlerMethod);

  // Logout user
  fastify.post('/auth/logout', {
    schema: authSchemas.logout,
    preHandler: [authenticate]
  }, controller.logout.bind(controller) as RouteHandlerMethod);

  // Get current authenticated user
  fastify.get('/auth/me', {
    preHandler: [authenticate]
  }, controller.getCurrentUser.bind(controller) as RouteHandlerMethod);
} 