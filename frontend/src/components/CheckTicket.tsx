import { FC, useState } from "react";
import { Button, TextField, Chip } from "@mui/material";

import { BoxItem } from "./BoxItem";
import { useGetTicketInfo } from "../hooks/useContractHooks";
import { Zone } from "../constants";

const style = { marginRight: "5px" };

const parseTicketInfo = (ticket: {
  expiration: number;
  zone: Zone;
}): { color: any; label: any } => {
  const expirationMs = ticket.expiration * 1000;
  const noInfo = expirationMs === 0;
  const hasTicketExpired = expirationMs < Date.now();

  const date = new Date(expirationMs);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return {
    color: noInfo ? "info" : hasTicketExpired ? "error" : "success",
    label: noInfo
      ? "No ticket bought for this plate number"
      : hasTicketExpired
      ? "Ticket has expired"
      : `Ticket is valid until: ${month}/${day}/${year}, ${formattedHours}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")} ${ampm} in zone ${Zone[ticket.zone]}`,
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
