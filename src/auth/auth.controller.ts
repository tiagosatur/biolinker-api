import { FastifyRequest, FastifyReply } from 'fastify';
import { FirebaseAuthError } from 'firebase-admin/auth';
import { AuthService } from './auth.service';
import { 
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest, 
  LogoutRequest 
} from './auth.types';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const authResponse = await this.authService.register(request.body);
      return reply.status(201).send(authResponse);
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

          if (errorCode === 'auth/weak-password') {
            return reply.status(400).send({
              statusCode: 400,
              error: 'Bad Request',
              message: 'Password is too weak. Please choose a stronger password.'
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

  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const authResponse = await this.authService.login(request.body);
      return reply.status(200).send(authResponse);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid email or password'
          });
        }
      }
      
      console.error('Unexpected error during login:', error);
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during login.'
      });
    }
  }

  async refreshToken(request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) {
    try {
      const refreshResponse = await this.authService.refreshToken(request.body);
      return reply.status(200).send(refreshResponse);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid refresh token') {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid refresh token'
          });
        }
      }
      
      console.error('Unexpected error during token refresh:', error);
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during token refresh.'
      });
    }
  }

  async logout(request: FastifyRequest<{ Body: LogoutRequest }>, reply: FastifyReply) {
    try {
      const logoutResponse = await this.authService.logout(request.body);
      return reply.status(200).send(logoutResponse);
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during logout.'
      });
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const uid = (request as any).user?.uid;
      if (!uid) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const user = await this.authService.getCurrentUser(uid);
      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found'
        });
      }

      return reply.status(200).send(user);
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching user data.'
      });
    }
  }
} 