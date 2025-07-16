import { FastifyRequest, FastifyReply } from 'fastify';
import { adminAuth } from '../utils/firebase';
import { auth } from '../utils/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    
    // First try to verify as an ID token
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      request.user = {
        uid: decodedToken.uid
      };
      return;
    } catch (error) {
      // If ID token verification fails, try custom token
      try {
        const userCredential = await signInWithCustomToken(auth, token);
        const idToken = await userCredential.user.getIdToken();
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        request.user = {
          uid: decodedToken.uid
        };
        return;
      } catch (customTokenError) {
        throw customTokenError;
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
} 