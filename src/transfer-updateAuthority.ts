import "dotenv/config";
import { getKeypairFromEnvironment, getExplorerLink } from "@solana-developers/helpers";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { 
  updateMetadataAccountV2,
  mplTokenMetadata,
  findMetadataPda
} from "@metaplex-foundation/mpl-token-metadata";
import { 
  createSignerFromKeypair, 
  signerIdentity, 
  publicKey as umiPublicKey,
  Umi
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import * as readline from "readline";

const user = getKeypairFromEnvironment("SOL_PRIVATE_KEY"); // MUST be the CURRENT update authority

//TODO: Change to "mainnet-beta" if working with mainnet tokens, or "devnet" for devnet
const cluster = "devnet";

//TODO: Replace with YOUR token mint account (the token whose update authority you want to transfer)
const tokenMintAccount = new PublicKey("BzKzjXa2XA9WtNvnZTnsv7ZLnTxq4Eu87rcSoUcX5qwW");

//TODO: Provide the NEW update authority public key via command line:
//      npm run transfer-authority <NEW_PUBKEY>
const newUpdateAuthorityStr = process.argv[2];
if (!newUpdateAuthorityStr) {
  throw new Error("Provide the new update authority pubkey as command line argument");
}
const newUpdateAuthority = umiPublicKey(newUpdateAuthorityStr);

// Initialize Umi
const umi: Umi = createUmi(clusterApiUrl(cluster));

// Convert Keypair to Umi format
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);
umi.use(signerIdentity(signer));
umi.use(mplTokenMetadata());

console.log(`Loaded keypair. Current (signing) update authority: ${user.publicKey.toBase58()}`);
console.log(`New update authority will be set to: ${newUpdateAuthorityStr}`);
console.log(`Token mint: ${tokenMintAccount.toBase58()}`);

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
  console.log("Transfer cancelled.");
  process.exit(0);
}

console.log("\nProceeding with transfer...\n");

const mint = umiPublicKey(tokenMintAccount.toBase58());
const metadataPda = findMetadataPda(umi, { mint });

try {
  // Update metadata account to transfer authority
  const result = await updateMetadataAccountV2(umi, {
    metadata: metadataPda,
    updateAuthority: signer,
    data: null, // leave existing metadata unchanged
    newUpdateAuthority: newUpdateAuthority,
  }).sendAndConfirm(umi);
  
  const signature = base58.deserialize(result.signature)[0];
  //TODO: Change "mainnet-beta" to "devnet" if you're using devnet
  console.log(`Tx confirmed: ${getExplorerLink("transaction", signature, cluster)}`);
  console.log(`Mint: ${getExplorerLink("address", tokenMintAccount.toBase58(), cluster)}`);
} catch (e) {
  console.error("Failed to set update authority:", e);
  process.exit(1);
}
