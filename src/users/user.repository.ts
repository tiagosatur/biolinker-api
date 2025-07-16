import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../shared/utils/firebase';
import { User } from './user.model';

export class UserRepository {
  private collection = adminDb.collection('users');

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = Timestamp.now();
    
    // Remove undefined values
    const userData = {
      uid: user.uid,
      username: user.username,
      ...(user.bio ? { bio: user.bio } : {}),
      ...(user.picture ? { picture: user.picture } : {}),
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(user.uid).set(userData);
    return userData;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const snapshot = await this.collection
      .where('username', '==', username)
      .limit(1)
      .get();
    
    return snapshot.empty;
  }

  async getByUsername(username: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), uid: doc.id } as User;
  }

  async getByUid(uid: string): Promise<User | null> {
    const doc = await this.collection.doc(uid).get();
    
    if (!doc.exists) {
      return null;
    }

    return { ...doc.data(), uid: doc.id } as User;
  }
} 