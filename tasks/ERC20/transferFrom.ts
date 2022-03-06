import { task } from "hardhat/config";


task("transferFrom", "Transfer from account to another one")
    .addParam("contract", "contract address")
    .addParam("recipient", "recipient address")
    .addParam("spender", "spender address")
    .addParam("value", "amount of tokens to transfer")
    .addParam("sender", "address, from you want to approve")
    .setAction(async (taskArgs, hre) => {
        const sender = await hre.ethers.getSigner(taskArgs.sender);
        const contract = await hre.ethers.getContractAt("TokenERC20", taskArgs.contract);

        await contract.connect(sender).transferFrom(
            taskArgs.spender,
            taskArgs.recipient,
            taskArgs.value
        );
    });