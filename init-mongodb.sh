#!/bin/bash

# Check if MONGODB_URI is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: ./init-mongodb.sh <MONGODB_URI> [WALLET_ADDRESS]"
  echo "Example: ./init-mongodb.sh 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/botx-db?retryWrites=true&w=majority' '0xYourWalletAddress'"
  exit 1
fi

# Set environment variables
export MONGODB_URI="$1"

# Set wallet address if provided
if [ ! -z "$2" ]; then
  export WALLET_ADDRESS="$2"
fi

# Run the initialization script
echo "Initializing MongoDB database..."
npx ts-node scripts/init-mongodb.ts

echo "Done!"
