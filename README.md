# BioLinker API

A Node.js API service built with Fastify and Firebase for managing bio link profiles. This service allows users to create and manage their personalized bio link pages with multiple customizable links.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📁 Project Structure

The project follows a Feature-Driven Architecture pattern where code is organized by domain features:

```
src/
├── app.ts                 # Main application setup
├── server.ts             # Server initialization
├── config/               # Configuration files
├── users/                # Users feature module
│   ├── user.controller.ts
│   ├── user.model.ts
│   ├── user.repository.ts
│   ├── user.routes.ts
│   └── user.service.ts
├── links/                # Links feature module
│   ├── link.controller.ts
│   ├── link.model.ts
│   ├── link.repository.ts
│   ├── link.routes.ts
│   └── link.service.ts
└── shared/              # Shared utilities and middleware
    ├── middleware/
    ├── types/
    └── utils/
```

## 🛠️ Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/tiagosatur/biolinker-api.git
   cd biolinker-api
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env`
   - Fill in the required environment variables:
     ```
     PORT=3000
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY=your-private-key
     FIREBASE_CLIENT_EMAIL=your-client-email
     ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Download your Firebase service account key
   - Update `firebase.json` and `.firebaserc` with your project details

## 🚀 Running the Project

**Development**

```bash
pnpm dev
```

**Production Build**

```bash
pnpm build
pnpm start
```

## 🔒 Authentication

The API uses Firebase Authentication. All protected routes require a valid Firebase ID token or custom token to be included in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 📝 API Documentation

### Users

- `POST /users` - Create a new user
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### Links

- `POST /links` - Create a new link
- `GET /links` - Get all links for authenticated user
- `GET /links/:id` - Get specific link
- `PUT /links/:id` - Update link
- `DELETE /links/:id` - Delete link

## 🧪 Testing

```bash
pnpm test
```

## 📜 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
