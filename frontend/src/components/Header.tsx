import { CSSProperties, FC } from "react";

import { ConnectWallet } from "./ConnectWallet";

const style: CSSProperties = {
  backgroundColor: "#282c34",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  position: "relative",
};

export const Header: FC = () => (
  <header style={style}>
    <h1>Parking App</h1>
    <ConnectWallet />
  </header>
);
