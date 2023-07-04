import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";
// import { BigNumber } from "@ethersproject/bignumber";

import { BoxItem } from "./BoxItem";
import { Zone } from "../constants";
import {
  useCustomContractFunction,
  useGetZonePrice,
} from "../hooks/useContractHooks";
import { ZoneSelect } from "./ZoneSelect";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const BuyTicket: FC = () => {
  const [zone, setZone] = useState<Zone | string>("");
  const [plate, setPlate] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [startTime, setStartTime] = useState<number>(Date.now() / 1000); // Initialize with current timestamp in seconds

  const zonePrice = useGetZonePrice(zone as Zone);
  const totalPrice = zonePrice.mul(duration || 0);
  const [tx, clearTx, buyTicket] = useCustomContractFunction("buyTicket");

  const handleBuyTicket = async () => {
    if (!plate || !duration || zone === "" || totalPrice.lte(0)) return;

    clearTx();
    await buyTicket(plate, duration, zone as Zone, startTime, {
      value: totalPrice,
    });
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
      <TextField
        style={style}
        label="Start Time"
        variant="outlined"
        type="datetime-local"
        value={new Date(startTime * 1000).toISOString().slice(0, -1)} // Convert start time to ISO string format for datetime-local input
        onChange={(e) =>
          setStartTime(new Date(e.target.value).getTime() / 1000)
        } // Convert input value to timestamp in seconds
      />
      <TextField
        style={style}
        label="Price (in Wei):"
        variant="outlined"
        type="number"
        value={totalPrice.toString()}
        InputProps={{
          readOnly: true,
        }}
      />
      <Button variant="contained" color="secondary" onClick={handleBuyTicket}>
        Buy ticket
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
