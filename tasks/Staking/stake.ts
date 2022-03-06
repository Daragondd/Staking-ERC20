import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";


task("stake", "Stake tokens for getting reward")
    .addParam("stakingtoken", "address of LP token you want to stake")
    .addParam("stakingcontract", "address of contract for staking")
    .addParam("wallet", "address of your wallet")
    .addParam("amount", "amount of tokens to stake")
    .setAction(async (taskArgs, hre) => {
        const stakingToken = await hre.ethers.getContractAt("IUniswapV2Pair", taskArgs.stakingtoken);
        const stakingContract = await hre.ethers.getContractAt("Staking", taskArgs.stakingcontract);

        const signer = await hre.ethers.getSigner(taskArgs.wallet);

        await stakingToken.connect(signer).approve(
            taskArgs.stakingcontract,
            taskArgs.amount
        );

        await stakingContract.connect(signer).stake(taskArgs.amount);
        });