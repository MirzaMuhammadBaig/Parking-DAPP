import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-deploy";
import "solidity-coverage";

const GOERLI_RPC_URL = 'https://goerli.infura.io/v3/e4889bb1f25c45ae8e3cca61938d765b' || "";
const MNEMONIC = 'kiss tattoo rabbit flavor fall damp divorce stable sad time traffic rival';
const ETHERSCAN_API_KEY = 'R5IVKDKYZ4X7Q62XDU2HAPUTRBN8RXEB72';
const PRIVATE_KEY = 'f31f61e5e3420118d62be9db5c5d8198cfe655793d2bc327ba9df4309ea5a163';
// const PRIVATE_KEYS = PRIVATE_KEY ? [PRIVATE_KEY] : [];

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: MNEMONIC ? { mnemonic: MNEMONIC } : PRIVATE_KEY,
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer.
    },
    feeCollector: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  mocha: {
    timeout: 100000,
  },
};
