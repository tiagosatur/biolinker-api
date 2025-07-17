import { adminAuth } from '../shared/utils/firebase';
import { FirebaseAuthClient } from '../infrastructure/firebase/firebase-auth.client';
import { UserRepository } from '../users/user.repository';
import { 
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest, 
  LogoutRequest,
  AuthResponse, 
  RefreshTokenResponse, 
  LogoutResponse,
  AuthUser,
  AuthTokens
} from './auth.types';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // Validate username availability
    const isAvailable = await this.userRepository.isUsernameAvailable(registerData.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: registerData.email,
      password: registerData.password,
      displayName: registerData.displayName || registerData.username,
      photoURL: registerData.picture,
    });

    try {
      // Create Firestore user document
      const user = await this.userRepository.create({
        uid: userRecord.uid,
        username: registerData.username,
        bio: registerData.bio,
        picture: registerData.picture,
      });

      // Immediately sign in with Firebase Auth REST API to get real tokens
      const authData = await FirebaseAuthClient.signInWithEmailAndPassword(
        registerData.email, 
        registerData.password
      );

      // Convert to auth response format
      const authUser: AuthUser = {
        uid: user.uid,
        email: registerData.email,
        username: user.username,
        bio: user.bio,
        picture: user.picture,
        createdAt: user.createdAt.toDate().toISOString(),
        updatedAt: user.updatedAt.toDate().toISOString()
      };

      const tokens: AuthTokens = FirebaseAuthClient.formatAuthTokens(authData);

      return {
        user: authUser,
        tokens
      };

    } catch (error) {
      // If anything fails, clean up Firebase Auth user
      await adminAuth.deleteUser(userRecord.uid);
      throw error;
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Authenticate with Firebase Auth REST API to verify password
      const authData = await FirebaseAuthClient.signInWithEmailAndPassword(
        loginData.email,
        loginData.password
      );

      const uid = authData.localId;
      
      // Get user profile from Firestore
      const userProfile = await this.userRepository.getByUid(uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const authUser: AuthUser = {
        uid: userProfile.uid,
        email: authData.email || loginData.email,
        username: userProfile.username,
        bio: userProfile.bio,
        picture: userProfile.picture,
        createdAt: userProfile.createdAt.toDate().toISOString(),
        updatedAt: userProfile.updatedAt.toDate().toISOString()
      };

      const tokens: AuthTokens = FirebaseAuthClient.formatAuthTokens(authData);

      return {
        user: authUser,
        tokens
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          throw error;
        }
      }
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const refreshAuthData = await FirebaseAuthClient.refreshIdToken(refreshData.refreshToken);

      return FirebaseAuthClient.formatRefreshTokens(refreshAuthData);

    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(logoutData: LogoutRequest): Promise<LogoutResponse> {
    // Note: Firebase doesn't have server-side token invalidation
    // The client should discard the tokens
    // In a production app, you might want to maintain a blacklist of tokens
    
    return {
      message: 'Successfully logged out'
    };
  }

  async getCurrentUser(uid: string): Promise<AuthUser | null> {
    try {
      const userRecord = await adminAuth.getUser(uid);
      const userProfile = await this.userRepository.getByUid(uid);
      
      if (!userProfile) {
        return null;
      }

      return {
        uid: userProfile.uid,
        email: userRecord.email || '',
        username: userProfile.username,
        bio: userProfile.bio,
        picture: userProfile.picture,
        createdAt: userProfile.createdAt.toDate().toISOString(),
        updatedAt: userProfile.updatedAt.toDate().toISOString()
      };

    } catch (error) {
      return null;
    }
  }
} 