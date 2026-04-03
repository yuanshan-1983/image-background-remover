export type D1StatementLike = {
  bind: (...values: unknown[]) => {
    first: <T = unknown>() => Promise<T | null>;
    all: <T = unknown>() => Promise<{ results: T[] }>;
    run: () => Promise<unknown>;
  };
  first?: <T = unknown>() => Promise<T | null>;
  all?: <T = unknown>() => Promise<{ results: T[] }>;
  run?: () => Promise<unknown>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1StatementLike;
};

export type CloudflareLike = {
  env?: unknown;
};

export function getCloudflareEnv() {
  const maybeEnv = globalThis.__OPENCLAW_CF_CTX__?.env;

  if (!maybeEnv || typeof maybeEnv !== "object") {
    return undefined;
  }

  return maybeEnv as Record<string, unknown>;
}

export function getEnvValue(name: string) {
  const cfEnv = getCloudflareEnv();
  const cfValue = cfEnv?.[name];

  if (typeof cfValue === "string" && cfValue.length > 0) {
    return cfValue;
  }

  const processValue = process.env[name];
  if (processValue) {
    return processValue;
  }

  return undefined;
}

export function getD1Binding() {
  const env = getCloudflareEnv();
  const db = env?.DB;

  if (!db) {
    return null;
  }

  return db as D1DatabaseLike;
}
