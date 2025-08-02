import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: "candidate" | "hr";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    userType?: "candidate" | "hr";
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface NextAuthOptions {
    providers?: any[];
    session?: any;
    pages?: any;
    callbacks?: any;
    [key: string]: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: "candidate" | "hr";
    name?: string;
    email?: string;
  }
}
