// Common error response schema
const errorResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// Basic auth user response (minimal)
const authUserResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    displayName: { type: 'string' }
  }
};

// Auth token response schema
const authTokenResponse = {
  type: 'object',
  properties: {
    user: authUserResponse,
    tokens: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' }
      }
    }
  }
};

export const authSchemas = {
  // POST /auth/register - Register new user
  register: {
    body: {
      type: 'object',
      required: ['email', 'password', 'username'],
      properties: {
        email: { 
          type: 'string', 
          format: 'email' 
        },
        password: { 
          type: 'string', 
          minLength: 6,
          maxLength: 128
        },
        username: { 
          type: 'string', 
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_-]+$'
        },
        displayName: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        bio: { 
          type: 'string', 
          maxLength: 500,
          nullable: true
        },
        avatarUrl: { 
          type: 'string', 
          format: 'uri',
          nullable: true
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark']
        },
        isPublic: {
          type: 'boolean'
        }
      }
    },
    response: {
      201: authTokenResponse,
      400: errorResponse,
      409: errorResponse // Conflict (email/username already exists)
    }
  },

  // POST /auth/login - Email/password login
  login: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { 
          type: 'string', 
          format: 'email' 
        },
        password: { 
          type: 'string',
          minLength: 1
        }
      }
    },
    response: {
      200: authTokenResponse,
      400: errorResponse,
      401: errorResponse // Invalid credentials
    }
  },

  // POST /auth/refresh - Refresh ID token
  refresh: {
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { 
          type: 'string',
          minLength: 1
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          idToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      400: errorResponse,
      401: errorResponse // Invalid refresh token
    }
  },

  // POST /auth/logout - Logout user
  logout: {
    body: {
      type: 'object',
      properties: {
        refreshToken: { 
          type: 'string',
          nullable: true
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      401: errorResponse
    }
  },

  // GET /auth/me - Get current auth user
  getCurrentUser: {
    response: {
      200: authUserResponse,
      401: errorResponse
    }
  }
}; 