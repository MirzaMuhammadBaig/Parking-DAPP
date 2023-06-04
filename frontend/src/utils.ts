import { formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

export const formatEtherToFixed = (ethBalance: BigNumber, precision: number = 6) =>
  parseFloat(formatEther(ethBalance)).toFixed(precision);
