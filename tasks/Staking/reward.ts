import { task } from "hardhat/config";

task("sendreward", "Send reward tokens to staking contract")
    .addParam("rewardtoken", "address of token you want to get as reward")
    .addParam("stakingcontract", "address of contract for staking")
    .addParam("wallet", "address of your wallet")
    .addParam("amount", "amount of tokens to stake")
    .setAction(async (taskArgs, hre) => {
        const rewardToken = await hre.ethers.getContractAt("ERC20", taskArgs.rewardtoken);
        const signer = await hre.ethers.getSigner(taskArgs.wallet);

        await rewardToken.connect(signer).transfer(
            taskArgs.stakingcontract,
            taskArgs.amount
        );
    });