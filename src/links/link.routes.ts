import { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { LinkController } from './link.controller';
import { authenticate } from '../shared/middleware/auth.middleware';

export async function linkRoutes(fastify: FastifyInstance, controller: LinkController) {
  // Schema for request validation
  const createLinkSchema = {
    body: {
      type: 'object',
      required: ['title', 'url'],
      properties: {
        title: { 
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        url: { 
          type: 'string',
          format: 'uri'
        },
        imageUrl: { 
          type: 'string',
          format: 'uri',
          nullable: true
        },
        order: { 
          type: 'integer',
          minimum: 0,
          nullable: true
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          url: { type: 'string' },
          order: { type: 'integer' },
          imageUrl: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          clicks: { type: 'integer' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      }
    }
  };

  fastify.post('/links', {
    schema: createLinkSchema,
    preHandler: [authenticate]
  }, controller.createLink.bind(controller) as RouteHandlerMethod);
} 