import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";

import { BoxItem } from "./BoxItem";
import { Zone } from "../constants";
import { useCustomContractFunction, useGetZonePrice } from "../hooks/useContractHooks";
import { ZoneSelect } from "./ZoneSelect";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const BuyTicket: FC = () => {
  const [zone, setZone] = useState<Zone | string>("");
  const [plate, setPlate] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const zonePrice = useGetZonePrice(zone as Zone);
  const totalPrice = zonePrice.mul(duration || 0);
  const [tx, clearTx, buyTicket] = useCustomContractFunction("buyTicket");

  const handleBuyTicket = async () => {
    if (!plate || !duration || zone === "") return;

    clearTx();
    await buyTicket(plate, duration, zone as Zone, { value: totalPrice });
  };

  return (
    <BoxItem label="Buy parking ticket">
      <TextField
        style={style}
        label="Car's plate"
        variant="outlined"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />
      <TextField
        style={style}
        label="Duration (mins):"
        variant="outlined"
        type="number"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        inputProps={{ min: "1" }}
      />
      <ZoneSelect zone={zone} setZone={setZone} />
      <Button variant="contained" color="secondary" onClick={handleBuyTicket}>
        Buy ticket
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
