# LMS - Learning Management System

LMS is a web-based educational learning platform designed to facilitate user management, online courses, and database-driven educational resources.

## Tech Stack

### Frontend & Framework
- **Next.js (v16)**: Full-stack React framework implementing server actions and App routing.
- **React (v19)**: Dynamic client-side UI rendering library.
- **TypeScript**: Typed dialect of JavaScript for standard type-safe development.

### Backend & Database Integration
- **Prisma ORM**: Object-Relational Mapping (ORM) to define data schemas and execute database migrations.
- **PostgreSQL Database Adapter (`pg` & `@prisma/adapter-pg`)**: Integration layer to connect with Postgres databases.
- **Firebase & Firebase Admin SDK**: Cloud integration for remote assets storage, file hosting, and user metadata management.

### Security & Authentication
- **Jose**: Standard library to sign and verify JSON Web Tokens (JWT) for secure session authentication.
- **BcryptJS**: Password hashing library to securely store encrypted credentials.
