import Fastify from 'fastify';
import cors from '@fastify/cors';
import { userRoutes } from './users/user.routes';
import { linkRoutes } from './links/link.routes';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';
import { UserRepository } from './users/user.repository';
import { LinkController } from './links/link.controller';
import { LinkService } from './links/link.service';
import { LinkRepository } from './links/link.repository';

export async function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true // Configure appropriately for production
  });

  // Initialize dependencies (simple DI)
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const linkRepository = new LinkRepository();
  const linkService = new LinkService(linkRepository);
  const linkController = new LinkController(linkService);

  // Register routes
  await fastify.register(async (fastify) => {
    await userRoutes(fastify, userController);
  }, { prefix: '/api' });

  await fastify.register(async (fastify) => {
    await linkRoutes(fastify, linkController);
  }, { prefix: '/api' });

  return fastify;
} 