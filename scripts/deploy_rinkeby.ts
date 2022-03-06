import { ethers } from "hardhat";

import dotenv from "dotenv";
dotenv.config()

async function main() {
    // We get the contract to deploy
    const addr: string = "0x0ce6dA4a039FB24a7a38E88d2F3002A03BEA7743";

    const deployer = await ethers.getSigner(addr);
    console.log(
        "Deploying contract with the account:",
        deployer.address
    );

    const Contract = await ethers.getContractFactory("ERC20");
    const contract = await Contract.connect(deployer).deploy();

    console.log("Contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });