import { task } from "hardhat/config";



task("transfer", "Transfer to someone")
    .addParam("contract", "contract address")
    .addParam("address", "wallet address")
    .addParam("value", "amount of tokens to transfer")
    .addParam("deployer", "account that deployed contract")
    .setAction(async (taskArgs, hre) => {
        const owner = taskArgs.deployer;
        const signer = await hre.ethers.getSigner(owner);
        const contract = await hre.ethers.getContractAt("TokenERC20", taskArgs.contract);

        await contract.connect(signer).transfer(taskArgs.address, taskArgs.value);
    });