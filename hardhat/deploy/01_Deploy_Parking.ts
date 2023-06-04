import { Signer } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Parking, Parking__factory } from "../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  let accounts: Signer[];
  let parkingContract: Parking;

  accounts = await hre.ethers.getSigners();
  const parkingFactory = (await hre.ethers.getContractFactory(
    "Parking",
    accounts[0]
  )) as Parking__factory;
  parkingContract = await parkingFactory.deploy();
  console.log(
    `The address the Contract WILL have once mined: ${parkingContract.address}`
  );
  await parkingContract.deployed();
};
export default func;
func.id = "parking_deploy";
func.tags = ["local"];
