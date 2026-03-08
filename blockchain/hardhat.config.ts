import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// connects to the root env file
dotenv.config({ path: "../.env" });

const config = defineConfig({
  solidity: "0.8.20",
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : "remote",
    },
  },
});

export default config;
