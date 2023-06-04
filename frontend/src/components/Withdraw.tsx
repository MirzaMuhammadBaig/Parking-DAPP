import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";
import { parseEther } from "@ethersproject/units";
import { useEtherBalance } from "@usedapp/core";

import { BoxItem } from "./BoxItem";
import { useCustomContractFunction } from "../hooks/useContractHooks";
import { formatEtherToFixed } from "../utils";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const Withdraw: FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [tx, clearTx, withdraw] = useCustomContractFunction("withdraw");
  const balance = useEtherBalance(process.env.REACT_APP_CONTRACT_ADDRESS);

  const handleWithdraw = async () => {
    if (!amount) return;

    clearTx();
    await withdraw(parseEther(amount));
  };

  return (
    <BoxItem label="Withdraw ETH">
      <TextField
        style={style}
        label="Amount (in ETH)"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        helperText={balance && `Balance in contract: ${formatEtherToFixed(balance, 18)} ETH`}
      />
      <Button style={{ maxHeight: "56px" }} variant="contained" color="error" onClick={handleWithdraw}>
        Withdraw ETH
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
