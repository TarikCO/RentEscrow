import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  const { ethers } = await hre.network.connect();
  const [tenantSigner] = await ethers.getSigners();

  const contractAddress = process.env.rent_escrow_address;
  if (!contractAddress) {
    throw new Error("Missing rent_escrow_address in .env");
  }

  const actor = (process.env.CONFIRM_ACTOR ?? "tenant").toLowerCase();
  const landlordPrivateKey =
    process.env.LANDLORD_PRIVATE_KEY ??
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

  const signer =
    actor === "landlord"
      ? new ethers.Wallet(landlordPrivateKey, ethers.provider)
      : tenantSigner;

  const escrow = await ethers.getContractAt("RentEscrow", contractAddress, signer);
  const tx = await escrow.confirmLease();
  await tx.wait();

  console.log(`Confirmed lease as ${actor}: ${signer.address}`);
  console.log(`Tx hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
