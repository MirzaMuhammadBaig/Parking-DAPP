import { FC, Dispatch } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { getZoneEnumKeys, Zone } from "../constants";

export const ZoneSelect: FC<{ zone: Zone | string; setZone: Dispatch<React.SetStateAction<string | Zone>> }> = ({
  zone,
  setZone,
}) => {
  return (
    <FormControl style={{ width: "100px", marginRight: "5px" }}>
      <InputLabel>Zone</InputLabel>
      <Select label="Zone" value={zone} onChange={(e) => setZone(e.target.value)}>
        {getZoneEnumKeys().map((k: any) => (
          <MenuItem key={k} value={Zone[k]}>
            {k}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
