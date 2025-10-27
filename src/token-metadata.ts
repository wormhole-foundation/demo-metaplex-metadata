import "dotenv/config";
import { getKeypairFromEnvironment, getKeypairFromFile, getExplorerLink } from "@solana-developers/helpers";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { 
  createMetadataAccountV3, 
  updateMetadataAccountV2,
  mplTokenMetadata,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { 
  createSignerFromKeypair, 
  signerIdentity, 
  publicKey as umiPublicKey,
  Umi
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

// based on https://solana.stackexchange.com/a/12429

// Load keypair from environment variable or .json file argument
const keypairFilePath = process.argv.find(arg => arg.endsWith('.json') && !arg.includes('package.json')) || null;
const user = keypairFilePath 
  ? await getKeypairFromFile(keypairFilePath)
  : getKeypairFromEnvironment("SOL_PRIVATE_KEY");

//TODO: subtitute with your token mint account  
const tokenMintAccount = new PublicKey("BzKzjXa2XA9WtNvnZTnsv7ZLnTxq4Eu87rcSoUcX5qwW");

console.log(`Loaded keypair securely! Public key: ${user.publicKey.toBase58()}`);

// Initialize Umi
const umi: Umi = createUmi(clusterApiUrl("devnet"));

// Convert Keypair to Umi format
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);
umi.use(signerIdentity(signer));
umi.use(mplTokenMetadata());

//TODO: update with your metadata
const metadataData = {
  name: "Test Token",
  symbol: "TEST",
  uri: "https://arweave.net/123",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const mint = umiPublicKey(tokenMintAccount.toBase58());
const metadataPda = findMetadataPda(umi, { mint });

if (process.argv[2] === 'update') {
  // Update existing metadata
  const result = await updateMetadataAccountV2(umi, {
    metadata: metadataPda,
    updateAuthority: signer,
    data: {
      ...metadataData,
      creators: null,
      collection: null,
      uses: null,
    },
    primarySaleHappened: false,
    isMutable: true,
  }).sendAndConfirm(umi);
  
  const signature = base58.deserialize(result.signature)[0];
  console.log(`Transaction confirmed, explorer link is: ${getExplorerLink("transaction", signature, "devnet")}`);
} else {
  // Create new metadata
  const result = await createMetadataAccountV3(umi, {
    mint,
    mintAuthority: signer,
    updateAuthority: signer.publicKey,
    data: {
      ...metadataData,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  }).sendAndConfirm(umi);
  
  const signature = base58.deserialize(result.signature)[0];
  console.log(`Transaction confirmed, explorer link is: ${getExplorerLink("transaction", signature, "devnet")}`);
}

console.log(`Look at the token mint again: ${getExplorerLink("address", tokenMintAccount.toString(), "devnet")}`);
