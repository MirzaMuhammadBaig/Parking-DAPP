import { FC, useState } from "react";
import { Button, TextField, Chip } from "@mui/material";

import { BoxItem } from "./BoxItem";
import { useGetTicketInfo } from "../hooks/useContractHooks";
import { Zone } from "../constants";

const style = { marginRight: "5px" };

const parseTicketInfo = (ticket: { expiration: number; zone: Zone }): { color: any; label: any } => {
  const expirationMs = ticket.expiration * 1000;
  const noInfo = expirationMs === 0;
  const hasTicketExpired = expirationMs < Date.now();

  return {
    color: noInfo ? "info" : hasTicketExpired ? "error" : "success",
    label: noInfo
      ? "No ticket bought for this plate number"
      : hasTicketExpired
      ? "Ticket has expired"
      : `Ticked is valid until: ${new Date(expirationMs).toLocaleString()} in zone ${Zone[ticket.zone]}`,
  };
};

export const CheckTicket: FC = () => {
  const [plate, setPlate] = useState<string>("");
  const [searchPlate, setSearchPlate] = useState<string>("");
  const ticketInfo = useGetTicketInfo(searchPlate);

  return (
    <BoxItem label="Check your parking ticket">
      <div>
        <div style={{ display: "flex" }}>
          <TextField
            style={style}
            label="Car's plate"
            variant="outlined"
            value={plate}
            onChange={(e) => {
              setPlate(e.target.value);
              setSearchPlate("");
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setSearchPlate("");
              setSearchPlate(plate);
            }}
          >
            Get Info
          </Button>
        </div>
        {searchPlate && ticketInfo.expiration !== undefined && (
          <Chip style={{ marginTop: "5px" }} {...parseTicketInfo(ticketInfo)} />
        )}
      </div>
    </BoxItem>
  );
};
