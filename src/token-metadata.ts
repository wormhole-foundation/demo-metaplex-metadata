import "dotenv/config";
import { getKeypairFromEnvironment, getExplorerLink } from "@solana-developers/helpers";
import { Connection, clusterApiUrl, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { 
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction 
} from "@metaplex-foundation/mpl-token-metadata";

// based on https://solana.stackexchange.com/a/12429

const user = getKeypairFromEnvironment("SOL_PRIVATE_KEY");
const connection = new Connection(clusterApiUrl("devnet"));
//TODO: subtitute with your token mint account  
const tokenMintAccount = new PublicKey("BzKzjXa2XA9WtNvnZTnsv7ZLnTxq4Eu87rcSoUcX5qwW");

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

console.log(`🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`);

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

const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

const instruction = process.argv[2] === 'update' 
  ? createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: user.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: metadataData,
          updateAuthority: user.publicKey,
          primarySaleHappened: null,
          isMutable: true,
        },
      }
    )
  : createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: tokenMintAccount,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: metadataData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

const tx = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(instruction),
  [user]
);

console.log(`✅ Transaction confirmed, explorer link is: ${getExplorerLink("transaction", tx, "devnet")}`);
console.log(`✅ Look at the token mint again: ${getExplorerLink("address", tokenMintAccount.toString(), "devnet")}`);
