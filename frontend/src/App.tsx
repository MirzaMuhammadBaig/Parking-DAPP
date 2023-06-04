import { CSSProperties, FC } from "react";
import { useEthers } from "@usedapp/core";
import { Chip, Container, Divider, Stack, Backdrop, CircularProgress } from "@mui/material";

import { useGetOwner } from "./hooks/useContractHooks";
import { BuyTicket, CancelTicket, ChangeZonePrice, CheckTicket, Header, TransferTicket, Withdraw } from "./components";

const appStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

export const App: FC = () => {
  const { error, active, account } = useEthers();
  const owner = useGetOwner();

  return (
    <Container style={{ fontFamily: "Roboto", padding: 0, maxWidth: "100%" }}>
      <Header />
      <Backdrop
        style={{ top: "80px" }}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={!active || !!error}
      >
        <div
          style={{
            width: "420px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "15px",
            textAlign: "center",
            backgroundColor: error ? "#9b1e1ede" : "#1565c0de",
          }}
        >
          <CircularProgress color="inherit" />
          <p>
            {!active && !error && "Please connect your wallet to use the app!"}
            {error && error.message}
          </p>
        </div>
      </Backdrop>
      <Stack spacing={2} style={appStyle}>
        <CheckTicket />
        <BuyTicket />
        <CancelTicket />
        <TransferTicket />
        {account && account === owner && (
          <>
            <Divider flexItem>
              <Chip color="warning" style={{ fontSize: "20px", marginBottom: "20px" }} label={"ADMIN Section"} />
            </Divider>
            <Withdraw />
            <ChangeZonePrice />
          </>
        )}
      </Stack>
    </Container>
  );
};

export default App;
