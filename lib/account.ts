import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import ResumeBuilder from "@/lib/models/ResumeBuilder";

type AccountPayload = {
  email: string;
  name: string;
  passwordHash: string;
};

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = cleanEmail(input.email);
  if (!name || !email.includes("@") || input.password.length < 8) {
    throw new Error("Use your name, a valid email, and a password of at least 8 characters.");
  }
  await dbConnect();
  const existing = await ResumeBuilder.exists({ kind: "account", recordId: email });
  if (existing) throw new Error("An account with this email already exists. Sign in instead.");
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    await ResumeBuilder.create({
      kind: "account",
      recordId: email,
      userId: email,
      updatedAt: new Date().toISOString(),
      payload: { email, name, passwordHash } satisfies AccountPayload,
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }
    throw error;
  }
  return { email, name };
}

export async function verifyAccount(email: string, password: string) {
  await dbConnect();
  const normalized = cleanEmail(email);
  const row = await ResumeBuilder.findOne({ kind: "account", recordId: normalized }).lean<{ payload?: AccountPayload }>();
  const account = row?.payload;
  if (!account?.passwordHash) return null;
  const matches = await bcrypt.compare(password, account.passwordHash);
  if (!matches) return null;
  return { id: account.email, email: account.email, name: account.name };
}
