import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service';
import { 
  AuthenticatedRequest, 
  UpdateProfileInputParams, 
  UsernameParams, 
  GetAllUsersQuery 
} from './user.types';

export class UserController {
  constructor(private userService: UserService) {}

  async getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const profile = await this.userService.getUserProfile(request.user.uid);
      if (!profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Profile not found'
        });
      }
      return reply.status(200).send(profile);
    } catch (error) {
      request.log.error(error, 'Error getting user profile');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error getting user profile'
      });
    }
  }

  async updateProfile(request: AuthenticatedRequest<{ Body: UpdateProfileInputParams }>, reply: FastifyReply) {
    try {
      const updatedProfile = await this.userService.updateUserProfile(
        request.user.uid,
        request.body
      );
      return reply.status(200).send(updatedProfile);
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

        // Handle other known errors
        if (error.message === 'Profile not found') {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Profile not found'
          });
        }

        if (error.message === 'Invalid profile data') {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid profile data'
          });
        }
      }
      
      // Log unexpected errors
      request.log.error(error, 'Error updating user profile');
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error updating user profile'
      });
    }
  }

  async deleteProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      await this.userService.deleteUserProfile(request.user.uid);
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error, 'Error deleting user profile');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error deleting user profile'
      });
    }
  }

  async getPublicProfile(request: FastifyRequest<{ Params: UsernameParams }>, reply: FastifyReply) {
    try {
      const profile = await this.userService.getPublicProfile(request.params.username);
      if (!profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Profile not found'
        });
      }
      return reply.status(200).send(profile);
    } catch (error) {
      request.log.error(error, 'Error getting public profile');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error getting public profile'
      });
    }
  }

  async getAllUsers(request: FastifyRequest<{ Querystring: GetAllUsersQuery }>, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers(request.query);
      return reply.status(200).send(users);
    } catch (error) {
      request.log.error(error, 'Error getting users list');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error getting users list'
      });
    }
  }
} 