import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUser } from './user.model';
import { UserService } from './user.service';
import { FirebaseAuthError } from 'firebase-admin/auth';

export class UserController {
  constructor(private userService: UserService) {}

  async register(request: FastifyRequest<{ Body: CreateUser }>, reply: FastifyReply) {
    try {
      const user = await this.userService.register(request.body);
      return reply.status(201).send(user);
    } catch (error) {
      if (error instanceof Error) {
        // Handle username conflict
        if (error.message === 'Username is already taken') {
          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'Username is already taken'
          });
        }
        
        // Handle Firebase Auth errors
        if (error instanceof FirebaseAuthError) {
          const errorCode = (error as any).errorInfo?.code;
          
          if (errorCode === 'auth/email-already-exists' || error.message.includes('email-already-in-use')) {
            return reply.status(409).send({
              statusCode: 409,
              error: 'Conflict',
              message: 'The email address is already in use by another account.'
            });
          }
        }
      }
      
      // Log unexpected errors
      console.error('Unexpected error during registration:', error);
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during registration.'
      });
    }
  }
} 