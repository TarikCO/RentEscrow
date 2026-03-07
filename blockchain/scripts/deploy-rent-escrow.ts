import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Replace with the account that should receive released rent.
  const landlordAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const durationSeconds = 7 * 24 * 60 * 60; // 7 days
  const yieldPercent = 3;
  const depositAmount = ethers.parseEther("1");

  const rentEscrow = await ethers.deployContract(
    "RentEscrow",
    [landlordAddress, durationSeconds, yieldPercent],
    { value: depositAmount }
  );

  await rentEscrow.waitForDeployment();

  const address = await rentEscrow.getAddress();
  console.log(`RentEscrow deployed at: ${address}`);
  console.log(`Tenant (deployer): ${deployer.address}`);
  console.log(`Landlord: ${landlordAddress}`);
  console.log(`Deposit (ETH): ${ethers.formatEther(depositAmount)}`);
  console.log(`Yield (%): ${yieldPercent}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
