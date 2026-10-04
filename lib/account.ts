import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import ResumeBuilder from "@/lib/models/ResumeBuilder";

const ACCOUNT_ID = "owner";

type AccountPayload = {
  email: string;
  name: string;
  passwordHash: string;
};

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function accountExists(): Promise<boolean> {
  await dbConnect();
  const row = await ResumeBuilder.exists({ kind: "account", recordId: ACCOUNT_ID });
  return Boolean(row);
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = cleanEmail(input.email);
  if (!name || !email.includes("@") || input.password.length < 8) {
    throw new Error("Use your name, a valid email, and a password of at least 8 characters.");
  }
  await dbConnect();
  const existing = await ResumeBuilder.exists({ kind: "account", recordId: ACCOUNT_ID });
  if (existing) throw new Error("An account already exists. Sign in instead.");
  const passwordHash = await bcrypt.hash(input.password, 12);
  await ResumeBuilder.create({
    kind: "account",
    recordId: ACCOUNT_ID,
    updatedAt: new Date().toISOString(),
    payload: { email, name, passwordHash } satisfies AccountPayload,
  });
  return { email, name };
}

export async function verifyAccount(email: string, password: string) {
  await dbConnect();
  const row = await ResumeBuilder.findOne({ kind: "account", recordId: ACCOUNT_ID }).lean<{ payload?: AccountPayload }>();
  const account = row?.payload;
  if (!account?.passwordHash || account.email !== cleanEmail(email)) return null;
  const matches = await bcrypt.compare(password, account.passwordHash);
  if (!matches) return null;
  return { id: account.email, email: account.email, name: account.name };
}
