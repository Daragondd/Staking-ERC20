import { task } from "hardhat/config";

task("unstake", "Unstake LP tokens")
    .addParam("stakingcontract", "address of contract for staking")
    .addParam("wallet", "address of your wallet")
    .setAction(async (taskArgs, hre) => {
        const stakingContract = await hre.ethers.getContractAt("Staking", taskArgs.stakingcontract);
        const signer = await hre.ethers.getSigner(taskArgs.wallet);

        await stakingContract.connect(signer).unstake();
    });