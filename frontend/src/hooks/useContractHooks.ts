import { useState, useEffect } from "react";
import { useContractCall, useContractFunction, TransactionStatus } from "@usedapp/core";
import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";

import { abi } from "../Parking.json";
import { Zone } from "../constants";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

const contractInterface = new Interface(abi);
const contract = new Contract(CONTRACT_ADDRESS, contractInterface);

const useContractFetch = (method: string, args: any[] = []) =>
  useContractCall({ abi: contractInterface, address: CONTRACT_ADDRESS, args, method }) || [];

const useContract = (method: string, options: object = {}) => useContractFunction(contract, method, options);

export const useGetOwner = (): string | undefined => {
  const [owner] = useContractFetch("owner");
  return owner;
};

export const useGetZonePrice = (zone: Zone): BigNumber => {
  const [price] = useContractFetch("zonePricePerMinute", [zone]);
  return price || BigNumber.from(0);
};

export const useGetTicketInfo = (plate: string): { expiration: number; zone: Zone } => {
  const [expiration, zone] = useContractFetch("getTicket", [plate]);
  return { expiration: expiration ? expiration.toNumber() : undefined, zone };
};

type UseSetZonePrice = (price: BigNumber, zone: Zone) => Promise<void>;
type UseBuyTicket = (plate: string, duration: number, zone: Zone, value: { value: BigNumber }) => Promise<void>;
type UseCancelTicket = (plate: string) => Promise<void>;
type UseTransferTicket = (oldPlate: string, newPlate: string, newOwner: string) => Promise<void>;
type UseWithdrawType = (amount: BigNumber) => Promise<void>;

type Withdraw = "withdraw";
type BuyTicket = "buyTicket";
type CancelTicket = "cancelTicket";
type SetZonePrice = "changeZonePrice";
type TransferTicket = "transferTicket";
type TransactionTypes = Withdraw | BuyTicket | CancelTicket | SetZonePrice | TransferTicket;

type WithdrawOrBuy<T extends TransactionTypes> = T extends Withdraw
  ? UseWithdrawType
  : T extends BuyTicket
  ? UseBuyTicket
  : T extends SetZonePrice
  ? UseSetZonePrice
  : T extends TransferTicket
  ? UseTransferTicket
  : UseCancelTicket;

export const useCustomContractFunction = <T extends TransactionTypes>(
  method: T
): [TransactionStatus, () => void, WithdrawOrBuy<T>] => {
  const { state, send } = useContract(method);
  const [tx, setTx] = useState(state);

  useEffect(() => {
    setTx(state);
  }, [state]);

  return [tx, () => setTx({ status: "None" }), send];
};
