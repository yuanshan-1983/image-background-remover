import { v4 as uuidv4 } from "uuid";
import type { DbAccount, DbSession, DbUser } from "./types";

export type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<unknown>;
      all: <T = unknown>() => Promise<{ results: T[] }>;
    };
  };
};

function nowIso() {
  return new Date().toISOString();
}

export async function getUserByEmail(db: D1DatabaseLike, email: string) {
  return db
    .prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`)
    .bind(email)
    .first<DbUser>();
}

export async function getUserById(db: D1DatabaseLike, id: string) {
  return db
    .prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<DbUser>();
}

export async function getUserByAccount(
  db: D1DatabaseLike,
  provider: string,
  providerAccountId: string
) {
  return db
    .prepare(
      `SELECT u.*
       FROM accounts a
       JOIN users u ON u.id = a.user_id
       WHERE a.provider = ? AND a.provider_account_id = ?
       LIMIT 1`
    )
    .bind(provider, providerAccountId)
    .first<DbUser>();
}

export async function createUser(
  db: D1DatabaseLike,
  input: Pick<DbUser, "email" | "name" | "image" | "email_verified">
) {
  const id = uuidv4();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO users (id, email, name, image, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, input.email, input.name, input.image, input.email_verified, now, now)
    .run();

  return getUserById(db, id);
}

export async function linkGoogleAccount(
  db: D1DatabaseLike,
  input: {
    userId: string;
    providerAccountId: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
    tokenType?: string | null;
    scope?: string | null;
    idToken?: string | null;
    sessionState?: string | null;
  }
) {
  const id = uuidv4();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO accounts (
        id, user_id, type, provider, provider_account_id, refresh_token, access_token,
        expires_at, token_type, scope, id_token, session_state, created_at, updated_at
      ) VALUES (?, ?, 'oauth', 'google', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.userId,
      input.providerAccountId,
      input.refreshToken ?? null,
      input.accessToken ?? null,
      input.expiresAt ?? null,
      input.tokenType ?? null,
      input.scope ?? null,
      input.idToken ?? null,
      input.sessionState ?? null,
      now,
      now
    )
    .run();

  return db.prepare(`SELECT * FROM accounts WHERE id = ? LIMIT 1`).bind(id).first<DbAccount>();
}

export async function createSession(
  db: D1DatabaseLike,
  input: { userId: string; expires: string; sessionToken: string }
) {
  const id = uuidv4();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO sessions (id, session_token, user_id, expires, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, input.sessionToken, input.userId, input.expires, now, now)
    .run();

  return db
    .prepare(`SELECT * FROM sessions WHERE session_token = ? LIMIT 1`)
    .bind(input.sessionToken)
    .first<DbSession>();
}

export async function getSessionAndUser(db: D1DatabaseLike, sessionToken: string) {
  const session = await db
    .prepare(`SELECT * FROM sessions WHERE session_token = ? LIMIT 1`)
    .bind(sessionToken)
    .first<DbSession>();

  if (!session) return null;

  const user = await getUserById(db, session.user_id);
  if (!user) return null;

  return { session, user };
}
