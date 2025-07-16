import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.model';

interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface> extends FastifyRequest<T> {
  user: { uid: string }
}

export class LinkController {
  constructor(private linkService: LinkService) {}

  async createLink(request: AuthenticatedRequest<{ Body: CreateLinkDto }>, reply: FastifyReply) {
    const userId = request.user.uid;
    const linkData = request.body;

    try {
      const newLink = await this.linkService.createLink(userId, linkData);
      return reply.status(201).send(newLink);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid URL provided') {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid URL provided'
        });
      }
      throw error; // Let the error handler middleware handle other errors
    }
  }
} 