'use client' // or avoid this file being imported by Server Components using Edge

// or force Node runtime in route
export const runtime = 'nodejs'

import { db } from './db';
import { users } from './db/schema';
import betterAuth from 'better-auth';

export const {
  getSession,
  signIn,
  signOut,
  getUser,
  requireAuth,
} = BetterAuth({
  providers: [
    {
      type: 'credentials',
      authorize: async ({ email, password }) => {
        // Find user and verify password
        // Return user object if credentials are valid
        // This is simplified, in a real app you would check against hashed passwords
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email)
        });
        
        if (!user || user.password !== password) {
          return null;
        }
        
        return user;
      }
    }
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  db,
  userTable: users,
});