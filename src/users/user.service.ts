import { UserRepository } from './user.repository';
import { 
  UpdateProfileInputParams, 
  UserProfileResponse, 
  PublicProfileResponse,
  PaginatedResponse,
  UserListItem,
  GetAllUsersQuery 
} from './user.types';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserProfile(uid: string): Promise<UserProfileResponse | null> {
    const profile = await this.userRepository.getUserProfile(uid);
    if (!profile) return null;

    return {
      id: profile.uid,
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl || null,
      theme: profile.theme,
      isPublic: profile.isPublic,
      createdAt: profile.createdAt.toDate().toISOString(),
      updatedAt: profile.updatedAt.toDate().toISOString(),
      links: profile.links.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        imageUrl: link.imageUrl || null,
        order: link.order,
        active: link.active,
        clicks: link.clicks
      }))
    };
  }

  async getPublicProfile(username: string): Promise<PublicProfileResponse | null> {
    const profile = await this.userRepository.getPublicProfile(username);
    if (!profile) return null;

    return {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl || null,
      theme: profile.theme,
      links: profile.links.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        imageUrl: link.imageUrl || null,
        order: link.order
      }))
    };
  }

  async updateUserProfile(uid: string, data: UpdateProfileInputParams): Promise<UserProfileResponse> {
    const updatedProfile = await this.userRepository.updateUserProfile(uid, data);
    const fullProfile = await this.getUserProfile(uid);
    if (!fullProfile) {
      throw new Error('Profile not found after update');
    }
    return fullProfile;
  }

  async deleteUserProfile(uid: string): Promise<void> {
    await this.userRepository.deleteUserProfile(uid);
  }

  async getAllUsers(query: GetAllUsersQuery): Promise<PaginatedResponse<UserListItem>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    const { users, total } = await this.userRepository.getAllUsers(page, limit, query.search);
    
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        username: user.username,
        displayName: user.displayName,
        bio: user.bio || null,
        avatarUrl: user.avatarUrl || null,
        theme: user.theme
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }
} 