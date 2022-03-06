import { task } from "hardhat/config";


task("approve", "approve particular account to transferFrom")
    .addParam("spender", "what account you want allow")
    .addParam("value", "amount of tokens to approve")
    .addParam("contract", "deployed contract addresss")
    .addParam("sender", "address, from you want to approve")
    .setAction(async (taskArgs, hre) => {
        const sender = await hre.ethers.getSigner(taskArgs.sender);
        const contract = await hre.ethers.getContractAt("TokenERC20", taskArgs.contract);

        await contract.connect(sender).approve(taskArgs.spender, taskArgs.value);
    });