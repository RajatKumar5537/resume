import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { accountName, verifyAccount } from "@/lib/account";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() || "";
        const password = credentials?.password?.toString() || "";
        if (!email || !password) throw new Error("Enter your email and password.");
        const account = await verifyAccount(email, password);
        if (!account) throw new Error("Email or password is incorrect.");
        return account;
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) token.name = user.name;
      if (user?.email) token.email = user.email;
      if (!token.name && typeof token.email === "string") {
        const name = await accountName(token.email);
        if (name) token.name = name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = typeof token.name === "string" ? token.name : session.user.name;
        session.user.email = typeof token.email === "string" ? token.email : session.user.email;
      }
      return session;
    },
  },
};

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  return email;
}
