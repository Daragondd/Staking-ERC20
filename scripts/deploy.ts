import { ethers } from "hardhat";

async function main() {

    const Factory = await ethers.getContractFactory("Staking");
    const staking = await Factory.deploy(
        "0x42E9d7170c28577C4Ef099dDAE0CA1013E70D627",
        "0x3B00Ef435fA4FcFF5C209a37d1f3dcff37c705aD",
        "0x6d0c6535826c61fee2c41facf800b1c01baaec3d",
        10,
        15
    );
    await staking.deployed();

    console.log("Staking contract deployed to:", staking.address);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
