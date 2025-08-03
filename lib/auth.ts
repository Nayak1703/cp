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

interface RedirectParams {
  url: string;
  baseUrl: string;
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
    async redirect({ url, baseUrl }: RedirectParams) {
      // For Google OAuth, redirect based on the callback URL
      if (url.startsWith(baseUrl) && url.includes("callback")) {
        // Check if this is a signup callback
        if (url.includes("signup")) {
          return `${baseUrl}/signup`;
        } else {
          return `${baseUrl}/login`;
        }
      }
      return url;
    },
    async signIn({ user, account }: SignInParams) {
      if (account?.provider === "google") {
        // For Google OAuth, always allow sign in
        // The callback page will handle role validation
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }: JwtParams) {
      console.log("JWT Callback - Input:", { user, account, token });

      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.name = user.name;
        token.email = user.email;
      }

      // For Google OAuth users, handle login only (not signup)
      if (account?.provider === "google" && user?.email) {
        console.log("Google OAuth - Processing user:", user.email);

        try {
          const [candidate, hr] = await Promise.all([
            db.candidateInfo.findUnique({
              where: { email: user.email },
            }),
            db.hrInfo.findUnique({ where: { email: user.email } }),
          ]);

          // Only set session if user exists (for login)
          if (candidate && !hr) {
            // Candidate found - set session
            token.userType = "candidate";
            token.name = `${candidate.firstName} ${candidate.lastName}`;
            token.id = candidate.id;
            console.log("Google OAuth - Candidate found, setting session");
          } else if (hr && !candidate) {
            // HR found - set session
            token.userType = "hr";
            token.name = `${hr.firstName} ${hr.lastName}`;
            token.id = hr.id;
            console.log("Google OAuth - HR found, setting session");
          } else if (!candidate && !hr) {
            // User not found - this is fine for signup, don't set session
            console.log(
              "Google OAuth - User not found in database (signup flow)"
            );
            // Don't set userType - let the signup process handle it
          } else {
            // User exists in both tables - this shouldn't happen
            console.log("Google OAuth - User exists in both tables");
            throw new Error("User exists in both tables");
          }
        } catch (error) {
          console.error(
            "Database error in JWT callback for Google OAuth:",
            error
          );
          throw error; // Re-throw to prevent login
        }
      }

      // For credential-based login, determine userType from database
      if (token.email && !token.userType && !account?.provider) {
        console.log(
          "JWT Callback - Checking database for userType (credentials only)"
        );
        try {
          const [candidate, hr] = await Promise.all([
            db.candidateInfo.findUnique({
              where: { email: token.email as string },
            }),
            db.hrInfo.findUnique({ where: { email: token.email as string } }),
          ]);

          console.log("JWT Callback - Database results:", { candidate, hr });

          if (candidate && !hr) {
            token.userType = "candidate";
            token.name = `${candidate.firstName} ${candidate.lastName}`;
            token.id = candidate.id;
            console.log("JWT Callback - Set userType to candidate");
          } else if (hr && !candidate) {
            token.userType = "hr";
            token.name = `${hr.firstName} ${hr.lastName}`;
            token.id = hr.id;
            console.log("JWT Callback - Set userType to hr");
          } else {
            console.log(
              "JWT Callback - User not found or exists in both tables"
            );
          }
        } catch (error) {
          console.error("Database error in JWT callback:", error);
        }
      }

      console.log("JWT Callback - Final token:", token);
      return token;
    },

    async session({ session, token }: SessionParams) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
