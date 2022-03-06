import { task } from "hardhat/config";

task("claim", "Claim reward of staking")
    .addParam("stakingcontract", "address of contract for staking")
    .addParam("wallet", "address of your wallet")
    .setAction(async (taskArgs, hre) => {
        // const stakingToken = await hre.ethers.getContractAt("IUniswapV2Pair", taskArgs.stakingtoken);
        // // const rewardToken = await hre.ethers.getContractAt("ERC20", taskArgs.rewardtoken);
        const stakingContract = await hre.ethers.getContractAt("Staking", taskArgs.stakingcontract);

        const signer = await hre.ethers.getSigner(taskArgs.wallet);

        await stakingContract.connect(signer).claim();
    });