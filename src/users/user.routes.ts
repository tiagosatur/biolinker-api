import { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { UserController } from './user.controller';
import { authenticate } from '../shared/middleware/auth.middleware';
import { userSchemas } from './user.schemas';

export async function userRoutes(fastify: FastifyInstance, controller: UserController) {
  // Get all users
  fastify.get('/users', {
    schema: userSchemas.getAllUsers
  }, controller.getAllUsers.bind(controller) as RouteHandlerMethod);

  // Get authenticated user's profile
  fastify.get('/user/profile', {
    schema: userSchemas.getProfile,
    preHandler: [authenticate]
  }, controller.getProfile.bind(controller) as RouteHandlerMethod);

  // Update user profile
  fastify.put('/user/profile', {
    schema: userSchemas.updateProfile,
    preHandler: [authenticate]
  }, controller.updateProfile.bind(controller) as RouteHandlerMethod);

  // Delete user profile
  fastify.delete('/user/profile', {
    schema: userSchemas.deleteProfile,
    preHandler: [authenticate]
  }, controller.deleteProfile.bind(controller) as RouteHandlerMethod);

  // Get public profile
  fastify.get('/users/:username', {
    schema: userSchemas.getPublicProfile
  }, controller.getPublicProfile.bind(controller) as RouteHandlerMethod);
} 