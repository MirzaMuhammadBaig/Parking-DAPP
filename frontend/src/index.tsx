import React from "react";
import ReactDOM from "react-dom";
import { ChainId, Config, DAppProvider } from "@usedapp/core";

import "./index.css";
import App from "./App";

const config: Config = { supportedChains: [ChainId.Goerli] };

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
