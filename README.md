# Metaplex Metadata Demo

A utility script for creating and managing SPL token metadata using the Metaplex Umi framework on Solana.

## Project Setup

1. Clone the Repository:

```bash
git clone https://github.com/wormhole-foundation/demo-metaplex-metadata
cd demo-metaplex-metadata
```

2. Install Dependencies:

```bash
npm install
```

3. Setup Keypair:

You can load your keypair in two ways:

Option A: Environment Variable (create a `.env` file):
```bash
SOL_PRIVATE_KEY="INSERT_PRIVATE_KEY"
```

Option B: Keypair File (use existing Solana CLI keypair):
```bash
# No setup needed - just pass the --keypair-file flag when running commands
# Example keypair location: ~/.config/solana/id.json
```

## Usage:

### 1. Create or Update Token Metadata

You can run the script to create or update metadata for an SPL token using the Metaplex Umi framework.

Creates the metadata for your SPL token:

```bash
npm run create-metadata
# Or with a keypair file:
npm run create-metadata ~/.config/solana/id.json
```

Updates the metadata:

```bash
npm run update-metadata
```

### 2. Transfer Update Authority

Transfer the update authority of your token to a new wallet address. This is useful when you want to hand over control of the token metadata to another party (e.g., a DAO, multisig, or another wallet).

```bash
npm run transfer-authority <NEW_AUTHORITY_PUBKEY>
```

## Important Notes
   - Never commit your private key or sensitive information  
   - Before transferring update authority: Make sure you have the correct new authority pubkey. This action is irreversible!
   - Update the following TODOs in the scripts:
     - token-metadata.ts:
       - Token mint account
       - Metadata details (name, symbol, URI, etc.)
     - transfer-updateAuthority.ts:
       - Token mint account (should match the one in token-metadata.ts)
       - Network (mainnet-beta or devnet)
       - New update authority pubkey (via command line argument)
