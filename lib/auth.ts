/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

// Type definitions for auth callbacks
interface SignInParams {
  user: any;
  account: any;
}

interface JwtParams {
  token: any;
  user: any;
  account: any;
}

interface SessionParams {
  session: any;
  token: any;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For credentials, we'll use the simplified approach
        // The role-based API already validated the user, so we just need to find them

        // Check candidate first
        const candidate = await db.candidateInfo.findUnique({
          where: { email: credentials.email },
        });

        if (candidate) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            candidate.password
          );

          if (isPasswordValid) {
            return {
              id: candidate.id,
              email: candidate.email,
              name: `${candidate.firstName} ${candidate.lastName}`,
              userType: "candidate",
            };
          }
        }

        // Check HR
        const hr = await db.hrInfo.findUnique({
          where: { email: credentials.email },
        });

        if (hr) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            hr.password
          );

          if (isPasswordValid) {
            return {
              id: hr.id,
              email: hr.email,
              name: `${hr.firstName} ${hr.lastName}`,
              userType: "hr",
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }: SignInParams) {
      if (account?.provider === "google") {
        const [candidate, hr] = await Promise.all([
          db.candidateInfo.findUnique({ where: { email: user.email! } }),
          db.hrInfo.findUnique({ where: { email: user.email! } }),
        ]);

        // Allow login if user exists in either table
        return !!(candidate || hr);
      }
      return true;
    },

    async jwt({ token, user, account }: JwtParams) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.name = user.name;
        token.email = user.email;
      }

      // For Google OAuth, don't set userType in JWT callback
      // Let the role selection in the callback handle it
      if (account?.provider === "google" && user?.email && !token.userType) {
        // Store the email for later use, but don't set userType yet
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }: SessionParams) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.name = token.name as string;

        // For Google OAuth users, if userType is not set, try to determine it
        if (!token.userType && token.email) {
          const [candidate, hr] = await Promise.all([
            db.candidateInfo.findUnique({
              where: { email: token.email as string },
            }),
            db.hrInfo.findUnique({ where: { email: token.email as string } }),
          ]);

          // Only set userType if user exists in exactly one table
          if (candidate && !hr) {
            session.user.userType = "candidate";
            session.user.name = `${candidate.firstName} ${candidate.lastName}`;
            session.user.id = candidate.id;
          } else if (hr && !candidate) {
            session.user.userType = "hr";
            session.user.name = `${hr.firstName} ${hr.lastName}`;
            session.user.id = hr.id;
          }
          // If user exists in both tables, don't set userType
          // This will force the user to select a role
        }
      }
      return session;
    },
  },
};
