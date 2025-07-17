import { firebaseConfig } from '../../config/env';

export interface FirebaseAuthResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  error?: {
    message: string;
  };
}

export interface FirebaseRefreshResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
  error?: { 
    message: string; 
  };
}

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * Firebase Authentication Client
 * Handles direct communication with Firebase Auth REST API
 */
export class FirebaseAuthClient {
  private static validateConfig() {
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API key not configured');
    }
  }

  /**
   * Calculate exact expiration time from seconds
   */
  private static calculateExpirationTime(expiresInSeconds: number): string {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    return expiresAt.toISOString();
  }

  /**
   * Sign in with email and password using Firebase Auth REST API
   */
  static async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseAuthResponse> {
    this.validateConfig();

    const response = await fetch(`${firebaseConfig.authBaseUrl}/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json() as FirebaseAuthResponse;

    if (!response.ok) {
      // Handle Firebase Auth errors
      if (data.error?.message?.includes('EMAIL_NOT_FOUND') || 
          data.error?.message?.includes('INVALID_PASSWORD') ||
          data.error?.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
        throw new Error('Invalid email or password');
      }
      throw new Error(data.error?.message || 'Authentication failed');
    }

    return data;
  }

  /**
   * Refresh ID token using refresh token
   */
  static async refreshIdToken(refreshToken: string): Promise<FirebaseRefreshResponse> {
    this.validateConfig();

    const response = await fetch(`${firebaseConfig.secureTokenUrl}/token?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json() as FirebaseRefreshResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || 'Invalid refresh token');
    }

    return data;
  }

  /**
   * Convert Firebase auth response to standardized tokens
   */
  static formatAuthTokens(authData: FirebaseAuthResponse): AuthTokens {
    const expiresInSeconds = parseInt(authData.expiresIn) || 3600;
    
    return {
      idToken: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresAt: this.calculateExpirationTime(expiresInSeconds)
    };
  }

  /**
   * Convert Firebase refresh response to standardized tokens
   */
  static formatRefreshTokens(refreshData: FirebaseRefreshResponse): AuthTokens {
    const expiresInSeconds = parseInt(refreshData.expires_in) || 3600;
    
    return {
      idToken: refreshData.id_token,
      refreshToken: refreshData.refresh_token,
      expiresAt: this.calculateExpirationTime(expiresInSeconds)
    };
  }
} 