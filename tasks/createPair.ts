import { task } from "hardhat/config";


task("createpair", "Create Pair")
    .addParam("token1", "Staking token")
    .addParam("token2", "Reward Token")
    .addParam("factory", "UniswapV2Factory address")

    .setAction(async (taskArgs, hre) => {
        const factory = await hre.ethers.getContractAt("UniswapV2Factory", taskArgs.factory);

        const addr = await factory.createPair(
            taskArgs.token1,
            taskArgs.token2
        );
        console.log("Address of LP token", addr);
    });