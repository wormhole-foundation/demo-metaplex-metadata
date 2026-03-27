import { describe, it, expect } from "vitest";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { validateNotExecutable } from "./validate-authority.js";

const connection = new Connection(clusterApiUrl("devnet"));

describe("validateNotExecutable", () => {
  // NGoD1yTeq5KaURrZo7MnCTFzTA4g62ygakJCnzMLCfm is an executable program on devnet
  it("should reject an executable program account", async () => {
    await expect(
      validateNotExecutable(connection, "NGoD1yTeq5KaURrZo7MnCTFzTA4g62ygakJCnzMLCfm")
    ).rejects.toThrow("executable program account");
  }, 30_000);

  // 4iUtozoQLdJ2FV7vXe9q215ETSw1Mnt8WKP4NyqNgAxz is a non-executable account (PDA/wallet)
  it("should allow a non-executable account", async () => {
    await expect(
      validateNotExecutable(connection, "4iUtozoQLdJ2FV7vXe9q215ETSw1Mnt8WKP4NyqNgAxz")
    ).resolves.toBeUndefined();
  }, 30_000);
});
