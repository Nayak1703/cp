import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

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
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
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

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.name = user.name;
        token.email = user.email;
      }

      // For Google OAuth, determine user type from database
      if (account?.provider === "google" && user?.email && !token.userType) {
        const [candidate, hr] = await Promise.all([
          db.candidateInfo.findUnique({ where: { email: user.email } }),
          db.hrInfo.findUnique({ where: { email: user.email } }),
        ]);

        if (candidate) {
          token.id = candidate.id;
          token.userType = "candidate";
          token.name = `${candidate.firstName} ${candidate.lastName}`;
        } else if (hr) {
          token.id = hr.id;
          token.userType = "hr";
          token.name = `${hr.firstName} ${hr.lastName}`;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
