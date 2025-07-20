// Common error response schema
const errorResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// Link object for responses
const linkObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    imageUrl: { type: 'string', format: 'uri', nullable: true },
    order: { type: 'integer' },
    active: { type: 'boolean' },
    clicks: { type: 'integer' }
  }
};

// Public link object (limited fields)
const publicLinkObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    imageUrl: { type: 'string', format: 'uri', nullable: true },
    order: { type: 'integer' }
  }
};

export const userSchemas = {
  // GET /user/profile - Get authenticated user's profile
  getProfile: {
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          theme: { type: 'string', enum: ['light', 'dark'] },
          isPublic: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          links: {
            type: 'array',
            items: linkObject
          }
        }
      },
      401: errorResponse
    }
  },

  // GET /users/:username - Get public profile
  getPublicProfile: {
    params: {
      type: 'object',
      required: ['username'],
      properties: {
        username: { 
          type: 'string', 
          minLength: 3, 
          maxLength: 30 
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          displayName: { type: 'string' },
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          theme: { type: 'string', enum: ['light', 'dark'] },
          links: {
            type: 'array',
            items: publicLinkObject
          }
        }
      },
      404: errorResponse
    }
  },

  // GET /users - Get all users
  getAllUsers: {
    querystring: {
      type: 'object',
      properties: {
        page: { 
          type: 'integer', 
          minimum: 1, 
          default: 1 
        },
        limit: { 
          type: 'integer', 
          minimum: 1, 
          maximum: 100, 
          default: 10 
        },
        search: { 
          type: 'string', 
          maxLength: 100,
          description: 'Search by username or displayName'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                displayName: { type: 'string' },
                bio: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', format: 'uri', nullable: true },
                theme: { type: 'string', enum: ['light', 'dark'] }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' }
            }
          }
        }
      },
      400: errorResponse
    }
  },

  // PUT /user/profile - Update user profile
  updateProfile: {
    body: {
      type: 'object',
      properties: {
        displayName: { 
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        username: { 
          type: 'string',
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_-]+$'
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
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          theme: { type: 'string', enum: ['light', 'dark'] },
          isPublic: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      400: errorResponse,
      401: errorResponse,
      404: errorResponse,
      409: errorResponse // Username already exists
    }
  },

  // DELETE /user/profile - Delete user profile
  deleteProfile: {
    response: {
      204: { type: 'null' },
      401: errorResponse
    }
  }
}; 