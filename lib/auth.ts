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
        // For Google OAuth, always allow sign in
        // The callback page will handle role validation
        return true;
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

      // For Google OAuth, store the email but don't set userType yet
      if (account?.provider === "google" && user?.email) {
        token.email = user.email;
        // Don't set userType here - let the callback page handle it
      }

      return token;
    },

    async session({ session, token }: SessionParams) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;

        // For Google OAuth users, try to determine userType based on database
        if (!token.userType && token.email) {
          try {
            const [candidate, hr] = await Promise.all([
              db.candidateInfo.findUnique({
                where: { email: token.email as string },
              }),
              db.hrInfo.findUnique({ where: { email: token.email as string } }),
            ]);

            // Set userType based on where the user exists
            if (candidate && !hr) {
              session.user.userType = "candidate";
              session.user.name = `${candidate.firstName} ${candidate.lastName}`;
              session.user.id = candidate.id;
              // Update token for persistence
              token.userType = "candidate";
              token.name = `${candidate.firstName} ${candidate.lastName}`;
              token.id = candidate.id;
            } else if (hr && !candidate) {
              session.user.userType = "hr";
              session.user.name = `${hr.firstName} ${hr.lastName}`;
              session.user.id = hr.id;
              // Update token for persistence
              token.userType = "hr";
              token.name = `${hr.firstName} ${hr.lastName}`;
              token.id = hr.id;
            }
            // If user exists in both tables or neither, don't set userType
            // This will be handled by the callback page
          } catch (error) {
            console.error("Database error in session callback:", error);
            // If database fails, don't set userType - let callback handle it
          }
        }
      }
      return session;
    },
  },
};
