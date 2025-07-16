import { adminAuth } from '../shared/utils/firebase';
import { CreateUser, User, UserResponse } from './user.model';
import { UserRepository } from './user.repository';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: CreateUser): Promise<UserResponse> {
    // Validate username availability
    const isAvailable = await this.userRepository.isUsernameAvailable(userData.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.username,
      photoURL: userData.picture,
    });

    // Create Firestore user document
    const user = await this.userRepository.create({
      uid: userRecord.uid,
      username: userData.username,
      bio: userData.bio,
      picture: userData.picture,
    });

    // Generate ID token for initial authentication
    const token = await adminAuth.createCustomToken(userRecord.uid);

    return this.toUserResponse(user, token);
  }

  private toUserResponse(user: User, token: string): UserResponse {
    return {
      uid: user.uid,
      username: user.username,
      bio: user.bio,
      picture: user.picture,
      createdAt: user.createdAt.toDate().toISOString(),
      updatedAt: user.updatedAt.toDate().toISOString(),
      token,
    };
  }
} 