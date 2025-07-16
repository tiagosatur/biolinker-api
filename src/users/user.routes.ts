import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';
import { createUserSchema } from './user.model';

export async function userRoutes(fastify: FastifyInstance, controller: UserController) {
  // Register new user
  fastify.post('/signup', {
    schema: createUserSchema,
  }, controller.register.bind(controller));
} 