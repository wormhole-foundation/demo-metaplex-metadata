import "dotenv/config";
import { getKeypairFromEnvironment, getExplorerLink } from "@solana-developers/helpers";
import { Connection, clusterApiUrl, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createUpdateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";
import * as readline from "readline";

const user = getKeypairFromEnvironment("SOL_PRIVATE_KEY"); // MUST be the CURRENT update authority

//TODO: Change to "mainnet-beta" if working with mainnet tokens, or "devnet" for devnet
const connection = new Connection(clusterApiUrl("mainnet-beta"));

//TODO: Replace with YOUR token mint account (the token whose update authority you want to transfer)
const tokenMintAccount = new PublicKey("BzKzjXa2XA9WtNvnZTnsv7ZLnTxq4Eu87rcSoUcX5qwW");

//TODO: Provide the NEW update authority public key via command line:
//      npm run transfer-authority <NEW_PUBKEY>
const newUpdateAuthorityStr = process.argv[2];
if (!newUpdateAuthorityStr) {
  throw new Error("Provide the new update authority pubkey as command line argument");
}
const newUpdateAuthority = new PublicKey(newUpdateAuthorityStr);

// Token Metadata program id
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

console.log(`🔑 Loaded keypair. Current (signing) update authority: ${user.publicKey.toBase58()}`);
console.log(`➡️  New update authority will be set to: ${newUpdateAuthority.toBase58()}`);
console.log(`🪙 Token mint: ${tokenMintAccount.toBase58()}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n⚠️  WARNING: This action is IRREVERSIBLE!");
console.log("⚠️  Once transferred, you will lose control of the token metadata.");
console.log("⚠️  Please double-check the new update authority address above.\n");

const confirmed = await new Promise<boolean>((resolve) => {
  rl.question("Proceed with transfer? (yes/no): ", (answer) => {
    rl.close();
    resolve(answer.trim().toLowerCase() === "yes");
  });
});

if (!confirmed) {
  console.log("❌ Transfer cancelled.");
  process.exit(0);
}

console.log("\n✅ Proceeding with transfer...\n");

const [metadataPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMintAccount.toBuffer()],
  TOKEN_METADATA_PROGRAM_ID
);

const ix = createUpdateMetadataAccountV2Instruction(
  {
    metadata: metadataPDA,
    updateAuthority: user.publicKey, // current UA must sign
  },
  {
    updateMetadataAccountArgsV2: {
      data: null,                    // leave existing metadata unchanged
      updateAuthority: newUpdateAuthority, 
      primarySaleHappened: null,     
      isMutable: null,             
    },
  }
);

(async () => {
  const txSig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(ix),
    [user]
  );
  //TODO: Change "mainnet-beta" to "devnet" if you're using devnet
  console.log(`✅ Tx confirmed: ${getExplorerLink("transaction", txSig, "mainnet-beta")}`);
  console.log(`🔎 Mint: ${getExplorerLink("address", tokenMintAccount.toBase58(), "mainnet-beta")}`);
})().catch((e) => {
  console.error("❌ Failed to set update authority:", e);
  process.exit(1);
});
