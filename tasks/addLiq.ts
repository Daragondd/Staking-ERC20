import { task } from "hardhat/config";


task("addliq", "Add liquidity")
    .addParam("token1", "Staking token")
    .addParam("token2", "Reward Token")
    .addParam("token1desired", "The amount of token1 to add as liquidity")
    .addParam("token2desired", "The amount of token2 to add as liquidity")
    .addParam("token1min", "Minimum token1 price")
    .addParam("token2min", "Minimum token2 price")
    .addParam("to", "Recipient of the liquidity tokens")
    .addParam("deadline", "Unix timestamp after which the transaction will revert")
    .addParam("router", "UniswapV2Router02 address")
    .setAction(async (taskArgs, hre) => {
        const router = await hre.ethers.getContractAt("UniswapV2Router02", taskArgs.router);
        
        await router.addLiquidity(
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.token1desired,
            taskArgs.token2desired,
            taskArgs.token1min,
            taskArgs.token2min,
            taskArgs.to,
            taskArgs.deadline
        );
    });