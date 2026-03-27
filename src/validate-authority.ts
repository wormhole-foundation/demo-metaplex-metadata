import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Validates that the given address is not an executable program account.
 * Programs cannot sign transactions, so transferring update authority
 * to a program would make the metadata permanently immutable.
 * Throws if the address is an executable program.
 */
export async function validateNotExecutable(
  connection: Connection,
  address: string
): Promise<void> {
  const pubkey = new PublicKey(address);
  const accountInfo = await connection.getAccountInfo(pubkey);
  if (accountInfo?.executable) {
    throw new Error(
      `The provided address (${address}) is an executable program account. ` +
      `Programs cannot sign transactions, so transferring update authority to a program ` +
      `would make the metadata permanently immutable. ` +
      `If you intend to use program-controlled authority, use a PDA derived from your program instead.`
    );
  }
}
