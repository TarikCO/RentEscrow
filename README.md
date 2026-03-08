# Connect-Hackaton
RentEscrow: Secure Smart Contract Rental Deposits
RentEscrow is a decentralized application (dApp) designed to protect tenants and landlords by securing security deposits in a blockchain-based escrow system. By integrating a Security Shield powered by GoPlus, the platform automatically assesses the risk of participant wallets before transactions occur, ensuring a safer rental market.

### Core Features:
Smart Escrow: Securely locks rental deposits in a Solidity smart contract, preventing unauthorized withdrawals.

Security Shield: Uses the GoPlus API to perform real-time risk analysis on wallet addresses, checking for phishing, blacklisting, and malicious history.

Guaranteed Yield: Implements logic to provide a 3% yield on held deposits, ensuring value is maintained over the lease term.

Automated Compliance: Features a Python-based FastAPI backend that coordinates between the user interface and the Ethereum Virtual Machine (EVM).

### Project Structure
The project is divided into three main environments to ensure a separation of concerns:

/blockchain: Contains the Hardhat environment, Solidity smart contracts, and deployment scripts.

/backend: A FastAPI server that handles security verification, environment configuration, and API routing.

/frontend: The user interface for interacting with the lease and escrow services.

### Technologies Used
Solidity: Smart contract logic.

Hardhat: Development and testing framework.

FastAPI: High-performance Python web framework.

Ethers.js (v6): Blockchain interaction library.

GoPlus API: Real-time security and risk forensics.
