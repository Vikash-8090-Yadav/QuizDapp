const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const Quizcraftarena = await hre.ethers.getContractFactory("QuizCraftArena")
  const quizcraftarena = await Quizcraftarena.deploy();
  await quizcraftarena.deployed();
  console.log("Quizcraftarena deployed to:", quizcraftarena.address);

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


