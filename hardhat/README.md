# Parking App Contract

## Instructions

> This script requires Node.js and NPM to run.

### Install dependencies

```sh
npm install
```

### Compile contract

```sh
npm run compile
```

### Run tests

```sh
npm test
```

### Deploying contract to testnet

> Fill .env file with required variables (you only need to fill either private key or mnemonic). For example check `.env.example`.

Deploy to goerli

```sh
npx hardhat deploy --network goerli
```

Verify contract on etherscan (optional)

```sh
npx hardhat verify contract_address_from_deploy --network goerli
```
