import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Parameters for RentEscrow contract
  const landlordAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with a test wallet or real address
  const durationSeconds = 7 * 24 * 60 * 60; // 7 days escrow duration
  const yieldPercent = 3; // 3% yield
  const depositAmount = ethers.parseEther("1"); // 1 ETH rent deposit for testing

  // Get the contract factory
  const RentEscrow = await ethers.getContractFactory("RentEscrow");

  // Deploy the contract with the constructor arguments
  const escrow = await RentEscrow.deploy(
    landlordAddress,
    durationSeconds,
    yieldPercent,
    { value: depositAmount } // Send ETH along with deployment
  );

  // Wait for deployment to finish
  await escrow.waitForDeployment();
  const contractAddress = await escrow.getAddress();

  console.log("RentEscrow deployed to:", contractAddress);
  console.log("Tenant (deployer) address:", deployer.address);
  console.log("Landlord address:", landlordAddress);
  console.log("Escrow amount (ETH):", ethers.formatEther(depositAmount));
  console.log("Yield %:", yieldPercent);
  console.log("Escrow deadline (unix timestamp):", (Math.floor(Date.now() / 1000) + durationSeconds));
}

// Run the script and catch errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});