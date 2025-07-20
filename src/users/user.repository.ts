import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../shared/utils/firebase';
import { User, UpdateProfileInputParams } from './user.types';
import { Link } from '../links/link.model';
import { calculateSearchLimits } from './user.helpers';

export interface InitializeProfileDto {
  uid: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: 'light' | 'dark';
  isPublic: boolean;
}

export class UserRepository {
  private collection = adminDb.collection('users');

  private getUserLinksCollection(userId: string) {
    return this.collection.doc(userId).collection('links');
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const snapshot = await this.collection
      .where('username', '==', username)
      .limit(1)
      .get();
    
    return snapshot.empty;
  }

  async getUserProfile(uid: string): Promise<User & { links: Link[] } | null> {
    const userDoc = await this.collection.doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }

    // Get user data
    const userData = { ...userDoc.data(), uid: userDoc.id } as User;

    // Get all links for the user
    const linksSnapshot = await this.getUserLinksCollection(uid)
      .orderBy('order', 'asc')
      .get();

    const links = linksSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Link[];

    return {
      ...userData,
      links
    };
  }

  async getPublicProfile(username: string): Promise<(User & { links: Link[] }) | null> {
    // Find user by username
    const snapshot = await this.collection
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = { ...userDoc.data(), uid: userDoc.id } as User;

    // If profile is not public, return without links
    if (!userData.isPublic) {
      return {
        ...userData,
        links: []
      };
    }

    // Get active links for the user, ordered by order field
    const linksSnapshot = await this.getUserLinksCollection(userDoc.id)
      .where('active', '==', true)
      .orderBy('order', 'asc')
      .get();

    const links = linksSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Link[];

    return {
      ...userData,
      links
    };
  }

  async updateUserProfile(uid: string, data: UpdateProfileInputParams): Promise<User> {
    const userRef = this.collection.doc(uid);

    // If username is being updated, check availability
    if (data.username) {
      const currentUser = await userRef.get();
      const currentUsername = currentUser.data()?.username;

      // Only check availability if username is actually changing
      if (currentUsername !== data.username) {
        const isAvailable = await this.isUsernameAvailable(data.username);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
      }
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    return { ...updatedDoc.data(), uid: updatedDoc.id } as User;
  }

  async deleteUserProfile(uid: string): Promise<void> {
    const userRef = this.collection.doc(uid);
    
    // Delete all links first
    const linksSnapshot = await this.getUserLinksCollection(uid).get();
    const batch = adminDb.batch();
    
    linksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user document
    batch.delete(userRef);
    
    // Execute batch
    await batch.commit();
  }

  async initializeProfile(data: InitializeProfileDto): Promise<User> {
    const userRef = this.collection.doc(data.uid);
    
    const user: User = {
      uid: data.uid,
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      theme: data.theme,
      isPublic: data.isPublic,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await userRef.set(user);
    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<{ users: User[]; total: number }> {
    let query = this.collection;

    // Add search if provided
    if (search) {
      // Get total count for each search type first
      const [usernameCount, displayNameCount] = await Promise.all([
        this.collection
          .where('username', '>=', search)
          .where('username', '<=', search + '\uf8ff')
          .count()
          .get(),
        this.collection
          .where('displayName', '>=', search)
          .where('displayName', '<=', search + '\uf8ff')
          .count()
          .get()
      ]);

      const counts = {
        username: usernameCount.data().count,
        displayName: displayNameCount.data().count
      };

      const { username: usernameLimit, displayName: displayNameLimit, total } = calculateSearchLimits(counts, limit);

      // Get paginated results with calculated limits
      const [usernameResults, displayNameResults] = await Promise.all([
        usernameLimit > 0 ? this.collection
          .where('username', '>=', search)
          .where('username', '<=', search + '\uf8ff')
          .orderBy('username')
          .offset((page - 1) * usernameLimit)
          .limit(usernameLimit)
          .get() : null,
        displayNameLimit > 0 ? this.collection
          .where('displayName', '>=', search)
          .where('displayName', '<=', search + '\uf8ff')
          .orderBy('displayName')
          .offset((page - 1) * displayNameLimit)
          .limit(displayNameLimit)
          .get() : null
      ]);

      // Combine and deduplicate results
      const userDocs = new Map();
      if (usernameResults) {
        usernameResults.docs.forEach(doc => {
          if (!userDocs.has(doc.id)) {
            userDocs.set(doc.id, doc);
          }
        });
      }
      if (displayNameResults) {
        displayNameResults.docs.forEach(doc => {
          if (!userDocs.has(doc.id)) {
            userDocs.set(doc.id, doc);
          }
        });
      }

      return {
        users: Array.from(userDocs.values()).map(doc => ({ ...doc.data(), uid: doc.id } as User)),
        total
      };
    }

    // If no search, use regular pagination
    const total = (await query.count().get()).data().count;
    
    const snapshot = await query
      .orderBy('username')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return {
      users: snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)),
      total
    };
  }
} 