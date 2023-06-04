import { FC } from "react";
import { Box, Divider, Chip } from "@mui/material";

export const BoxItem: FC<{ label: string }> = ({ label, children }) => {
  return (
    <Box style={{ marginTop: "15px", marginBottom: "20px" }} sx={{ width: "100%" }}>
      <Divider flexItem>
        <Chip label={label} />
      </Divider>
      <div style={{ margin: "10px 10px 0 10px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "left", width: "900px" }}>{children}</div>
      </div>
    </Box>
  );
};
