import { expect } from "chai";
import { ethers } from "hardhat";

import { Contract, Signer, BigNumber } from "ethers";



describe("ERC-20 RUB token", function () {
  let token: Contract;
  let signers: Signer[];

  const _name: string = "Russian ruble";
  const _symbol: string = "RUB";
  const _decimals: number = 18;
  const _totalSupply: BigNumber = BigNumber.from("1" + "0".repeat(_decimals));


    const getBalance = (_addr: string, token: Contract) => {
        return token.balanceOf(_addr);
    }


    beforeEach(async function () {
        signers = await ethers.getSigners();

        const Token = await ethers.getContractFactory("ERC20");
        token = await Token.deploy();
        await token.deployed();
    });


    describe("View functions", function () {
        it("name()", async function () {
            const name = await token.name();
            expect(name).to.be.eq(_name);
        });


        it("symbol()", async function () {
            const symbol = await token.symbol();
            expect(symbol).to.be.eq(_symbol);
        });


        it("decimals()", async function () {
            const decimals: BigNumber = await token.decimals();
            expect(decimals).to.be.eq(_decimals);
        });


        it("totalSupply()", async function () {
            let actual_totalSupply = await token.totalSupply();

            const result = _totalSupply.eq(actual_totalSupply);
            expect(result).to.be.eq(true);
        });

        it("allowance()", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // balance < _amount
            await expect(
                token.connect(signer2).approve(addr, _totalSupply.div(2))
            ).to.be.revertedWith("Your balance less, than amount");

            expect(
                await token.allowance(addr, owner)
            ).to.be.eq(0);

            // balance >= _amount
            await token.connect(signer1).approve(addr, _totalSupply.div(2));

            const _allow = await token.allowance(owner, addr);

            expect(
                _totalSupply.div(2).eq(_allow)
            ).to.be.eq(true);
        });

        it("balanceOf()", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // before transfer
            let balance1 = await getBalance(owner, token);
            let balance2 = await getBalance(addr, token);

            expect(
                balance2
            ).to.be.eq(0);

            expect(
                balance1.eq(_totalSupply)
            ).to.be.eq(true);

            await token.transfer(addr, _totalSupply.div(2));

            // after transfer
            balance1 = await getBalance(owner, token);
            balance2 = await getBalance(addr, token);

            expect(
                balance1.eq(_totalSupply.div(2))
            ).to.be.eq(true);

            expect(
                balance2.eq(_totalSupply.div(2))
            ).to.be.eq(true);
        });
    });


    describe("Functions", function () {
        it("transfer()", async function () {
            //  _amount >= balance

            let addr = await signers[1].getAddress();
            let amount = _totalSupply.add(BigNumber.from(1));

            expect(
                await getBalance(addr, token)
            ).to.be.eq(0);

            await expect(
                token.transfer(addr, amount)
            ).to.be.revertedWith("Amount more than your balance");

            expect(
                await getBalance(addr, token)
            ).to.be.eq(0);

            // _amount <= balance

            let sender = token.signer
            let balance_sender = await getBalance(await sender.getAddress(), token);

            let result = balance_sender.eq(_totalSupply);
            expect(result).to.be.eq(true)

            await token.connect(sender).transfer(addr, _totalSupply)

            balance_sender = await getBalance(await sender.getAddress(), token);
            expect(balance_sender).to.be.eq(0);

            balance_sender = await getBalance(addr, token);
            expect(balance_sender).to.be.eq(_totalSupply)
        });


        it("transferFrom()", async function () {
            let [signer, signer1, signer2] = signers;

            const owner = await signer.getAddress();
            const addr1 = await signer1.getAddress();
            const addr2 = await signer2.getAddress();

            await expect(
                token.transferFrom(addr1, owner, _totalSupply.div(2))
            ).to.be.revertedWith("Check allowance");

            //allowance[owner][addr] < amount
            await expect(
                token.connect(signer1).transferFrom(owner, addr2, _totalSupply.div(2))
            ).to.be.revertedWith("Your balance less, than amount");

            // transfering and checking balances
            await token.approve(addr1, _totalSupply.div(2));
            await token.connect(signer1).transferFrom(owner, addr2, _totalSupply.div(2));

            const balance1 = await getBalance(owner, token);
            const balance2 = await getBalance(addr2, token);

            expect(
                balance1.eq(_totalSupply.div(2))
            ).to.be.eq(true);

            expect(
                balance2.eq(_totalSupply.div(2))
            ).to.be.eq(true);
        });

        it("approve()", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // case when value > balance
            await expect(
                token.connect(signer2).approve(owner, _totalSupply.div(2))
            ).to.be.revertedWith("Your balance less, than amount");

            await token.approve(addr, _totalSupply.div(2));
            const allow = await token.allowance(owner, addr);

            expect(
                _totalSupply.div(2).eq(allow)
            ).to.be.eq(true);
        });

        it("increaseAllowance()", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // before increaseAllowance
            await token.approve(addr, _totalSupply.div(2));
            let allow = await token.allowance(owner, addr);

            expect(
                _totalSupply.div(2).eq(allow)
            ).to.be.eq(true);

            //after increaseAllowance
            await token.increaseAllowance(addr, _totalSupply.div(2));
            allow = await token.allowance(owner, addr);

            expect(
                _totalSupply.eq(allow)
            ).to.be.eq(true);
        });

        it("decreaseAllowance()", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // before decreaseAllowance
            await token.approve(addr, _totalSupply.div(2));
            let allow = await token.allowance(owner, addr);

            expect(
                _totalSupply.div(2).eq(allow)
            ).to.be.eq(true);

            // amount > balance
            await expect(
                token.decreaseAllowance(addr, _totalSupply)
            ).to.be.revertedWith("Allowed much less than could be decrease");

            // amount <= balance
            await token.decreaseAllowance(addr, _totalSupply.div(2));
            allow = await token.allowance(owner, addr);

            expect(
                allow
            ).to.be.eq(0);

        });

        it("mint()", async function () {
            let [_, signer] = signers;
            const addr = await signer.getAddress();

            // case msg.sender != owner
            await expect(
                token.connect(signer).mint(addr, _totalSupply.div(4))
            ).to.be.revertedWith("Only owner can call this function");

            let supply = await token.totalSupply();
            expect(
                _totalSupply.eq(supply)
            ).to.be.eq(true);

            // case msg.sender == owner
            await token.mint(addr, _totalSupply);
            supply = await token.totalSupply();

            expect(
                _totalSupply.mul(2).eq(supply)
            ).to.be.eq(true);
        });

        it("burn()", async function () {
            let [_, signer, signer1] = signers;

            // msg.sender != owner
            await expect(
                token.connect(signer).burn(_totalSupply.add(1))
            ).to.be.revertedWith("Only owner can call this function");

            let supply = await token.totalSupply();
            expect(
                _totalSupply.eq(supply)
            ).to.be.eq(true);

            //balance <= value
            const addr1 = await signer1.getAddress();

            await token.transfer(addr1, _totalSupply.div(2))

            await expect(
                token.burn(_totalSupply)
            ).to.be.revertedWith("You haven't such amount of tokens");

            // case msg.sender == owner
            await token.burn(_totalSupply.div(2));

            supply = await token.totalSupply();
            expect(
                _totalSupply.div(2).eq(supply)
            ).to.be.eq(true);
        });
    });

    describe("Events", function () {
        it("Transfer", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            // some transfers
            await expect(
                token.transfer(addr, _totalSupply.div(8))
            )
            .to.emit(token, "Transfer")
            .withArgs(owner, addr, _totalSupply.div(8));


            await expect(
                token.connect(signer2).transfer(owner, _totalSupply.div(10))
            )
            .to.emit(token, "Transfer")
            .withArgs(addr, owner, _totalSupply.div(10));
        })

        it("Approval", async function () {
            let [signer1, signer2] = signers;

            const owner = await signer1.getAddress();
            const addr = await signer2.getAddress();

            await expect(
                token.approve(addr, _totalSupply.div(20))
            )
            .to.emit(token, "Approval")
            .withArgs(owner, addr, _totalSupply.div(20));
        })
    });
});
