import { expect } from "chai";
import { ethers } from "hardhat";

import { Contract, Signer } from "ethers";



describe("Staking", function () {;
    let staking: Contract;

    let token1: Contract; // RUB1
    let token2: Contract; // RUB2

    let token3: Contract; // LP (типа)

    let signers: Signer[];

    beforeEach(async function () {
        signers = await ethers.getSigners();

        let Factory4 = await ethers.getContractFactory("ERC20");
        token3 = await Factory4.deploy();
        await token3.deployed();

        let Factory3 = await ethers.getContractFactory("ERC20");
        token2 = await Factory3.deploy();
        await token2.deployed();

        let Factory2 = await ethers.getContractFactory("ERC20");
        token1 = await Factory2.deploy();
        await token1.deployed();

        let Factory = await ethers.getContractFactory("Staking");
        staking = await Factory.deploy(
            token1.address,
            token2.address,
            token3.address,
            10,
            15
        );
        await staking.deployed();

        await token1.mint(
            await signers[1].getAddress(),
            100
        );
        await token1.mint(
            await signers[2].getAddress(),
            100  
        );
        await token3.mint(
            staking.address,
            100  
        );
    });

    describe("Function for contributor", function (){
        it("stake func", async () => {
            let user = signers[1];
            let user1 = signers[2];

            await token1.connect(user).approve(
                staking.address,
                100
            );

            await token1.connect(user1).approve(
                staking.address,
                100
            );
        
            await staking.connect(user).stake(100);

            await expect(
                staking.connect(user).stake(10000)
            ).to.be.revertedWith("You don't have enough tokens");

            // first stake
            await staking.connect(user1).stake(50);
            let contributor = await staking.contributors(await user1.getAddress());
            
            expect(
                contributor[0]
            ).to.be.eq(50);
            expect(
                contributor[2]
            ).to.be.eq(0);
            expect(
                contributor[3]
            ).to.be.true;
            
            // second stake
            await ethers.provider.send("evm_increaseTime", [15]);
            await staking.connect(user1).stake(50);

            contributor = await staking.contributors(await user1.getAddress());

            expect(
                contributor[0]
            ).to.be.eq(100);
            expect(
                contributor[2]
            ).to.be.eq(10);
            expect(
                contributor[3]
            ).to.be.true;

        });

        it("claim func", async () => {
            let user = signers[1];

            await token1.connect(user).approve(
                staking.address,
                100
            );

            await staking.connect(user).stake(100);

            await expect(
                staking.connect(user).claim()
            ).to.be.revertedWith("Please, try later");

            await ethers.provider.send("evm_increaseTime", [15]);

            await staking.connect(user).claim();

            expect(
                await token3.balanceOf(
                    await user.getAddress()
                )
            ).to.be.eq(20);
            
            const contributor = await staking.contributors(await user.getAddress());

            expect(
                contributor[2]
            ).to.be.eq(0);
        });

        it("unstake func", async () => {
            let user = signers[1];

            await expect(
                staking.connect(user).unstake()
            ).to.be.revertedWith("Nothing to unstake");

            await token1.connect(user).approve(
                staking.address,
                100
            );

            await staking.connect(user).stake(100);

            await staking.connect(user).unstake();

            expect(
                await token1.balanceOf(
                    await user.getAddress()
                )
            ).to.be.eq(100);
        });
    })

    describe("Function for administrator", function (){

        it("setFreezeTime func", async () => {
            await expect(
                staking.setFreezeTime(2)
            ).to.be.revertedWith("Freeze time must be >= 5 seconds");

            await expect(
                staking.setFreezeTime(10000)
            ).to.be.revertedWith("Freeze time must be <= 1 hour");

            await staking.setFreezeTime(15);

            expect(
                await staking.freezeTime()
            ).to.be.eq(15);
        });

        it("setPercent func", async () => {
            await expect(
                staking.setPercent(1)
            ).to.be.revertedWith("Try 5%, 10% or 15%");

            await staking.setPercent(5);

            expect(
                await staking.percent()
            ).to.be.eq(5);
        });
    });   
});