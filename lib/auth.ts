import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { verifyAccount } from "@/lib/account";

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
};

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session;
}
