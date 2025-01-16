# Metaplex Metadata Demo

A utility script for creating and managing SPL token metadata using the Metaplex SDK on Solana.

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

3. Setup environment variable:

```bash
SOL_PRIVATE_KEY="INSERT_PRIVATE_KEY"
```

## Usage:
You can run the script to create or update metadata for an SPL token using the Metaplex SDK.

Creates the metadata for your SPL token:

```bash
npm run create-metadata
```

Updates the metadata:

```bash
npm run update-metadata
```

## Important Notes
   - Never commit your private key or sensitive information  
   - Update the following TODOs in the token-metadata script:  
      - Token mint account     
      - metadata details
