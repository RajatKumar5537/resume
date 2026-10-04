import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import ResumeBuilder from "@/lib/models/ResumeBuilder";

type AccountPayload = {
  email?: string;
  name?: string;
  passwordHash?: string;
};

type AccountRow = {
  _id: unknown;
  recordId?: string;
  userId?: string;
  email?: string;
  name?: string;
  passwordHash?: string;
  payload?: AccountPayload;
};

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

function accountEmail(row: AccountRow): string {
  return cleanEmail(row.email || row.payload?.email || "");
}

let publishing: Promise<void> | null = null;

export function ensureAccountsVisible(): Promise<void> {
  if (!publishing) publishing = publishAccounts().catch((error) => {
    publishing = null;
    throw error;
  });
  return publishing;
}

async function publishAccounts(): Promise<void> {
  await dbConnect();
  const accounts = await ResumeBuilder.find({ kind: "account" }).lean<AccountRow[]>();
  for (const row of accounts) {
    const email = accountEmail(row);
    const passwordHash = row.passwordHash || row.payload?.passwordHash || "";
    if (!email || !passwordHash.startsWith("$2")) continue;
    const name = (row.name || row.payload?.name || "").trim();
    await ResumeBuilder.updateOne(
      { _id: row._id },
      {
        $set: {
          recordId: email,
          userId: email,
          email,
          name,
          passwordHash,
          updatedAt: new Date().toISOString(),
          payload: { email, name, passwordHash },
        },
        $unset: { password: "" },
      },
    );
    if (row.recordId === "owner" || row.recordId !== email) {
      await ResumeBuilder.updateOne(
        { kind: "profile", recordId: "owner" },
        { $set: { recordId: email, userId: email } },
      );
      await ResumeBuilder.updateMany(
        { kind: "resume", $or: [{ userId: { $exists: false } }, { userId: "" }, { userId: null }, { userId: "owner" }] },
        { $set: { userId: email } },
      );
    }
  }
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = cleanEmail(input.email);
  if (!name || !email.includes("@") || input.password.length < 8) {
    throw new Error("Use your name, a valid email, and a password of at least 8 characters.");
  }
  await ensureAccountsVisible();
  const existing = await ResumeBuilder.exists({ kind: "account", recordId: email });
  if (existing) throw new Error("An account with this email already exists. Sign in instead.");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const payload: AccountPayload = { email, name, passwordHash };
  try {
    await ResumeBuilder.create({
      kind: "account",
      recordId: email,
      userId: email,
      email,
      name,
      passwordHash,
      updatedAt: new Date().toISOString(),
      payload,
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }
    throw error;
  }
  return { email, name };
}

export async function accountName(email: string): Promise<string> {
  const normalized = cleanEmail(email);
  if (!normalized) return "";
  await ensureAccountsVisible();
  const row = await ResumeBuilder.findOne({ kind: "account", recordId: normalized }).lean<AccountRow>();
  return (row?.name || row?.payload?.name || "").trim();
}

export async function verifyAccount(email: string, password: string) {
  const normalized = cleanEmail(email);
  await ensureAccountsVisible();
  const row = await ResumeBuilder.findOne({ kind: "account", recordId: normalized }).lean<AccountRow>();
  const passwordHash = row?.passwordHash || row?.payload?.passwordHash;
  const accountEmailValue = row ? accountEmail(row) : "";
  if (!passwordHash || !accountEmailValue) return null;
  const matches = await bcrypt.compare(password, passwordHash);
  if (!matches) return null;
  return { id: accountEmailValue, email: accountEmailValue, name: row?.name || row?.payload?.name || "" };
}

export async function resetPassword(email: string, password: string) {
  const normalized = cleanEmail(email);
  if (!normalized.includes("@") || password.length < 8) {
    throw new Error("Use the account email and a new password of at least 8 characters.");
  }
  await ensureAccountsVisible();
  const row = await ResumeBuilder.findOne({ kind: "account", recordId: normalized }).lean<AccountRow>();
  if (!row) throw new Error("No account uses that email.");
  const passwordHash = await bcrypt.hash(password, 12);
  const name = (row.name || row.payload?.name || "").trim();
  await ResumeBuilder.updateOne(
    { _id: row._id },
    {
      $set: {
        recordId: normalized,
        userId: normalized,
        email: normalized,
        name,
        passwordHash,
        updatedAt: new Date().toISOString(),
        payload: { email: normalized, name, passwordHash },
      },
      $unset: { password: "" },
    },
  );
  return { email: normalized };
}
