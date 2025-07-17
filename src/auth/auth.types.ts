export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  bio?: string;
  picture?: string;
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
  uid: string;
  email: string;
  username: string;
  bio?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
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