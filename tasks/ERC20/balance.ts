import { task } from "hardhat/config";


task("balance", "to check the balance by address")
    .addParam("address", "address of some account")
    .addParam("contract", "deployed contract addresss")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt("TokenERC20", taskArgs.contract);

        const balance = await contract.balanceOf(taskArgs.address);
        console.log(balance);
    });