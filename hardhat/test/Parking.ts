import { expect } from "chai";
import { Signer } from "ethers";
import { ethers, web3 } from "hardhat";

import { Parking, Parking__factory } from "../typechain";

const ONLY_OWNER = "Ownable: caller is not the owner";
const ONLY_BUYER = "Only ticket owner can modify it";
const ERRORS = {
  BUY_TICKET: {
    AMOUNT_NOT_SUFFICIENT: "Amount is not sufficient",
    WRONG_ZONE: "You are trying to renew ticket for other parking zone",
    PAUSED: "Pausable: paused",
  },
  CHANGE_PRICE: { ONLY_OWNER },
  CANCEL_TICKET: { ONLY_BUYER, EXPIRED: "The ticket has already expired" },
  TRANSFER_TICKET: {
    ONLY_BUYER,
    ACTIVE_SUB:
      "You cannot transfer ticket to a plate with active subscription",
  },
  WITHDRAW: {
    ONLY_OWNER,
    BALANCE_TOO_LOW: "Contract's balance too low to withdraw such amount",
  },
};

describe("Parking", function () {
  let accounts: Signer[];
  let parkingContract: Parking;
  const plateNum = "plate";

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const parkingFactory = (await ethers.getContractFactory(
      "Parking",
      accounts[0]
    )) as Parking__factory;
    parkingContract = await parkingFactory.deploy();
  });

  describe("Init", function () {
    it("Should init zone prices", async function () {
      const zoneA = await parkingContract.zonePricePerMinute(0);
      const zoneB = await parkingContract.zonePricePerMinute(1);
      const zoneC = await parkingContract.zonePricePerMinute(2);

      expect(zoneA.toString()).to.equal("20000000000000");
      expect(zoneB.toString()).to.equal("15000000000000");
      expect(zoneC.toString()).to.equal("10000000000000");
    });
  });

  describe("Buy ticket", function () {
    it("Should allow ticket purchase if none existing yet", async function () {
      const zone = 0;
      const isTicketValidBeforeBuy = await parkingContract.isTicketValid(
        plateNum,
        zone
      );
      const zoneAPrice = await parkingContract.zonePricePerMinute(zone);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      const isTicketValidAfterBuy = await parkingContract.isTicketValid(
        plateNum,
        zone
      );

      expect(isTicketValidBeforeBuy).to.be.false;
      expect(isTicketValidAfterBuy).to.be.true;
    });

    it("Should allow to extend existing ticket expiration", async function () {
      const zone = 0;
      const zoneAPrice = await parkingContract.zonePricePerMinute(zone);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      // buy two 5min tickets
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });

      // go forward in time for 7 minutes
      const sevenMins = 7 * 60;
      await ethers.provider.send("evm_increaseTime", [sevenMins]);
      await ethers.provider.send("evm_mine", []);

      const isTicketValid = await parkingContract.isTicketValid(plateNum, zone);
      expect(isTicketValid).to.be.true;
    });

    it("Should throw an error if user's balance too low to purchase", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      expect(
        parkingContract.buyTicket(plateNum, numOfMins + 1, 0, { value })
      ).eventually.to.be.rejectedWith(ERRORS.BUY_TICKET.AMOUNT_NOT_SUFFICIENT);
    });

    it("Should throw an error if trying to extend existing ticket in other zone", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });

      expect(
        parkingContract.buyTicket(plateNum, numOfMins, 1, { value })
      ).eventually.to.be.rejectedWith(ERRORS.BUY_TICKET.WRONG_ZONE);
    });

    it("Should throw an error if user try to buy a ticket but the contract is paused", async function () {
      await parkingContract.pause();
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      expect(
        parkingContract.buyTicket(plateNum, numOfMins + 1, 0, { value })
      ).eventually.to.be.rejectedWith(ERRORS.BUY_TICKET.PAUSED);
    });
  });

  describe("Change price", function () {
    it("Should change price of the zone", async function () {
      const zone = 0;
      const newPrice = 1;
      await parkingContract.changeZonePrice(newPrice, zone);
      const zonePriceAfterChange = await parkingContract.zonePricePerMinute(
        zone
      );

      expect(zonePriceAfterChange).to.equal(newPrice);
    });

    it("Should throw an error if non contract owner tries to change price", async function () {
      expect(
        parkingContract.connect(accounts[1]).changeZonePrice(0, 0)
      ).eventually.to.be.rejectedWith(ERRORS.CHANGE_PRICE.ONLY_OWNER);
    });
  });

  describe("Cancel ticket", function () {
    it("Should cancel ticket and get back 90% of unused minutes", async function () {
      const zone = 0;
      const zoneAPrice = await parkingContract.zonePricePerMinute(zone);
      const numOfMins = 10;
      const value = zoneAPrice.mul(numOfMins);
      const from = await accounts[0].getAddress();
      await parkingContract.buyTicket(plateNum, numOfMins, zone, { value });

      // go forward in time for 1:30 min => should get 2 min less since it round to int
      await ethers.provider.send("evm_increaseTime", [90]);
      await ethers.provider.send("evm_mine", []);

      const balanceBeforeWithdrawing = await web3.eth.getBalance(from);
      const cancelTicketCall = await parkingContract.cancelTicket(plateNum);
      const isTicketValid = await parkingContract.isTicketValid(plateNum, zone);
      const { gasUsed } = await web3.eth.getTransactionReceipt(
        cancelTicketCall.hash
      );
      const txFee = cancelTicketCall.gasPrice!.mul(gasUsed);
      const balanceAfterWithdrawing = await web3.eth.getBalance(from);
      const balanceBeforeWithoutFee = ethers.BigNumber.from(
        balanceBeforeWithdrawing
      ).sub(txFee);
      const valueLeft = zoneAPrice
        .mul(numOfMins - 2)
        .mul(9)
        .div(10); // 2 minutes less and only 90%

      expect(isTicketValid).to.be.false;
      expect(
        ethers.BigNumber.from(balanceAfterWithdrawing)
          .sub(balanceBeforeWithoutFee)
          .toString()
      ).to.equal(valueLeft.toString());
    });

    it("Should throw an error if non ticket buyer tries to cancel ticket", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      expect(
        parkingContract.connect(accounts[1]).cancelTicket(plateNum)
      ).eventually.to.be.rejectedWith(ERRORS.CANCEL_TICKET.ONLY_BUYER);
    });

    it("Should throw an error if trying to cancel expired ticket", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });

      // go forward in time for numOfMins minutes
      const forwardMins = numOfMins * 60;
      await ethers.provider.send("evm_increaseTime", [forwardMins]);
      await ethers.provider.send("evm_mine", []);

      expect(
        parkingContract.cancelTicket(plateNum)
      ).eventually.to.be.rejectedWith(ERRORS.CANCEL_TICKET.EXPIRED);
    });
  });

  describe("Transfer ticket", function () {
    it("Should transfer ticket to other plate and owner", async function () {
      const zone = 0;
      const newPlateNum = "newPlate";
      const zoneAPrice = await parkingContract.zonePricePerMinute(zone);
      const numOfMins = 10;
      const value = zoneAPrice.mul(numOfMins);
      const newOwner = await accounts[1].getAddress();
      await parkingContract.buyTicket(plateNum, numOfMins, zone, { value });
      await parkingContract.transferTicket(plateNum, newPlateNum, newOwner);

      const isTicketValid = await parkingContract.isTicketValid(
        newPlateNum,
        zone
      );
      expect(isTicketValid).to.be.true;
      // expect error if old owner try to cancel the ticket
      expect(
        parkingContract.cancelTicket(newPlateNum)
      ).eventually.to.be.rejectedWith(ERRORS.CANCEL_TICKET.ONLY_BUYER);
      // new owner can cancel the ticket
      await parkingContract.connect(accounts[1]).cancelTicket(newPlateNum);
      const isTicketValidAfterCancel = await parkingContract.isTicketValid(
        newPlateNum,
        zone
      );
      expect(isTicketValidAfterCancel).to.be.false;
    });

    it("Should throw an error if trying to transfer subscription to active ticket", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      const newPlateNum = "newPlate";
      const newOwner = await accounts[1].getAddress();
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      await parkingContract
        .connect(accounts[1])
        .buyTicket(newPlateNum, numOfMins, 0, { value });
      expect(
        parkingContract.transferTicket(plateNum, newPlateNum, newOwner)
      ).eventually.to.be.rejectedWith(ERRORS.TRANSFER_TICKET.ACTIVE_SUB);
    });

    it("Should throw an error if non ticket buyer tries to transfer ticket", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      const newPlateNum = "newPlate";
      const newOwner = await accounts[1].getAddress();
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      expect(
        parkingContract
          .connect(accounts[1])
          .transferTicket(plateNum, newPlateNum, newOwner)
      ).eventually.to.be.rejectedWith(ERRORS.TRANSFER_TICKET.ONLY_BUYER);
    });
  });

  describe("Withdraw", function () {
    it("Should empty contract balance when withdrawing", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      const from = await accounts[0].getAddress();
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });
      expect(await web3.eth.getBalance(parkingContract.address)).to.equal(
        value.toString()
      );

      const balanceBeforeWithdrawing = await web3.eth.getBalance(from);
      const withdrawCall = await parkingContract.withdraw(value);
      const { gasUsed } = await web3.eth.getTransactionReceipt(
        withdrawCall.hash
      );
      const txFee = withdrawCall.gasPrice!.mul(gasUsed);
      const balanceAfterWithdrawing = await web3.eth.getBalance(from);

      expect(await web3.eth.getBalance(parkingContract.address)).to.equal("0");
      expect(value.add(balanceBeforeWithdrawing).sub(txFee)).to.equal(
        balanceAfterWithdrawing
      );
    });

    it("Should throw an error if trying to withdraw more funds that are in contract", async function () {
      const zoneAPrice = await parkingContract.zonePricePerMinute(0);
      const numOfMins = 5;
      const value = zoneAPrice.mul(numOfMins);
      await parkingContract.buyTicket(plateNum, numOfMins, 0, { value });

      expect(
        parkingContract.withdraw(value.add(1))
      ).eventually.to.be.rejectedWith(ERRORS.WITHDRAW.BALANCE_TOO_LOW);
    });

    it("Should throw an error if non contract owner tries to withdraw funds", async function () {
      expect(
        parkingContract.connect(accounts[1]).withdraw(1)
      ).eventually.to.be.rejectedWith(ERRORS.WITHDRAW.ONLY_OWNER);
    });
  });
});
