import { describe, expect, it } from "vitest";
import { parseEnv } from "./index";

const valid = {
  DATABASE_URL: "postgresql://u:p@localhost:5432/db",
  AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  AUTH_GOOGLE_ID: "google-id",
  AUTH_GOOGLE_SECRET: "google-secret",
};

describe("parseEnv", () => {
  it("returns typed configuration for a complete environment", () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it("names every missing variable in the error message", () => {
    expect(() => parseEnv({})).toThrowError(/DATABASE_URL[\s\S]*AUTH_SECRET/);
  });

  it("starts without Google credentials; empty values count as unset", () => {
    const base = {
      DATABASE_URL: valid.DATABASE_URL,
      AUTH_SECRET: valid.AUTH_SECRET,
    };
    expect(parseEnv(base).AUTH_GOOGLE_ID).toBeUndefined();
    const env = parseEnv({
      ...base,
      AUTH_GOOGLE_ID: "",
      AUTH_GOOGLE_SECRET: "",
    });
    expect(env.AUTH_GOOGLE_ID).toBeUndefined();
    expect(env.AUTH_GOOGLE_SECRET).toBeUndefined();
  });

  it("requires Google id and secret together", () => {
    const base = {
      DATABASE_URL: valid.DATABASE_URL,
      AUTH_SECRET: valid.AUTH_SECRET,
    };
    expect(() => parseEnv({ ...base, AUTH_GOOGLE_ID: "id" })).toThrowError(
      /AUTH_GOOGLE_SECRET/
    );
    expect(() => parseEnv({ ...base, AUTH_GOOGLE_SECRET: "s" })).toThrowError(
      /AUTH_GOOGLE_ID/
    );
  });

  it("rejects a DATABASE_URL that is not a postgres URL", () => {
    expect(() =>
      parseEnv({ ...valid, DATABASE_URL: "mysql://localhost/db" })
    ).toThrowError(/DATABASE_URL/);
  });

  it("rejects a too-short AUTH_SECRET", () => {
    expect(() => parseEnv({ ...valid, AUTH_SECRET: "short" })).toThrowError(
      /AUTH_SECRET/
    );
  });

  it("does not leak secret values into the error message", () => {
    expect(() => parseEnv({ ...valid, AUTH_SECRET: "short" })).not.toThrowError(
      /short/
    );
  });
});
