import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";

import { BoxItem } from "./BoxItem";
import { useCustomContractFunction } from "../hooks/useContractHooks";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const CancelTicket: FC = () => {
  const [plate, setPlate] = useState<string>("");
  const [tx, clearTx, cancelTicket] = useCustomContractFunction("cancelTicket");

  const handleCancelTicket = async () => {
    if (!plate) return;

    clearTx();
    await cancelTicket(plate);
  };

  return (
    <BoxItem label="Cancel parking ticket">
      <TextField
        style={style}
        label="Car's plate"
        variant="outlined"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />
      <Button variant="contained" color="error" onClick={handleCancelTicket}>
        Cancel ticket
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
