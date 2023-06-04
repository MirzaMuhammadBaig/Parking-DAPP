import { FC, useState } from "react";
import { Button, TextField } from "@mui/material";
import { parseEther } from "@ethersproject/units";

import { BoxItem } from "./BoxItem";
import { Zone } from "../constants";
import { useCustomContractFunction, useGetZonePrice } from "../hooks/useContractHooks";
import { ZoneSelect } from "./ZoneSelect";
import { formatEtherToFixed } from "../utils";
import { Toast } from "./Toast";

const style = { marginRight: "5px" };

export const ChangeZonePrice: FC = () => {
  const [zone, setZone] = useState<Zone | string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const zonePrice = useGetZonePrice(zone as Zone);
  const [tx, clearTx, setZonePrice] = useCustomContractFunction("changeZonePrice");

  const handleChangeZonePrice = async () => {
    if (!newPrice || zone === "") return;

    clearTx();
    await setZonePrice(parseEther(newPrice), zone as Zone);
  };

  return (
    <BoxItem label="Change zone price">
      <ZoneSelect zone={zone} setZone={setZone} />
      <TextField
        style={style}
        label="New price (in ETH)"
        variant="outlined"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
        helperText={`Current price ${formatEtherToFixed(zonePrice, 18)} ETH`}
      />
      <Button color="warning" style={{ maxHeight: "56px" }} variant="contained" onClick={handleChangeZonePrice}>
        Change zone price
      </Button>
      <Toast tx={tx} />
    </BoxItem>
  );
};
