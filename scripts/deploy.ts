import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying SciFund contract...");

  const SciFund = await ethers.getContractFactory("SciFund");
  const sciFund = await upgrades.deployProxy(SciFund);
  await sciFund.deployed();

  console.log("SciFund deployed to:", sciFund.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 