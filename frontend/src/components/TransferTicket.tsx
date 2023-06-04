import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";

import { BoxItem } from "./BoxItem";
import { useCustomContractFunction } from "../hooks/useContractHooks";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const TransferTicket: FC = () => {
  const [oldPlate, setOldPlate] = useState<string>("");
  const [newPlate, setNewPlate] = useState<string>("");
  const [newOwner, setNewOwner] = useState<string>("");
  const [tx, clearTx, transferTicket] = useCustomContractFunction("transferTicket");

  const handleTransferTicket = async () => {
    if (!oldPlate || !newPlate || !newOwner) return;

    clearTx();
    await transferTicket(oldPlate, newPlate, newOwner);
  };

  return (
    <BoxItem label="Transfer parking ticket">
      <TextField
        style={style}
        label="Car's old plate"
        variant="outlined"
        value={oldPlate}
        onChange={(e) => setOldPlate(e.target.value)}
      />
      <TextField
        style={style}
        label="Car's new plate"
        variant="outlined"
        value={newPlate}
        onChange={(e) => setNewPlate(e.target.value)}
      />
      <TextField
        style={style}
        label="New plate owner"
        variant="outlined"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />
      <Button variant="contained" color="success" onClick={handleTransferTicket}>
        Transfer ticket
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
