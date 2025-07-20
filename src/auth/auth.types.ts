export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: 'light' | 'dark';
  isPublic?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  idToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LogoutResponse {
  message: string;
}