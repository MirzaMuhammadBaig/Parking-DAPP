import { FC, useEffect, useState } from "react";
import { Alert, AlertColor, Snackbar, SnackbarCloseReason } from "@mui/material";
import { TransactionStatus, getExplorerTransactionLink } from "@usedapp/core";

const txStatusToToSeverity = (isMining: boolean, isSuccess: boolean): AlertColor => {
  if (isMining) return "info";
  else if (isSuccess) return "success";
  else return "error";
};

export const Toast: FC<{ tx: TransactionStatus }> = ({ tx }) => {
  const [open, setOpen] = useState(false);
  const isNotNone = tx.status !== "None";
  const isMining = tx.status === "Mining";
  const isSuccess = tx.status === "Success";

  useEffect(() => {
    if (tx.status !== "None") {
      setOpen(true);
    }
  }, [tx.status]);

  const handleClose = (_: any, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") return;

    setOpen(false);
  };

  return (
    <>
      {isNotNone && (
        <Snackbar
          autoHideDuration={isMining ? null : 8000}
          open={open}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={handleClose}
        >
          <Alert variant="filled" onClose={handleClose} severity={txStatusToToSeverity(isMining, isSuccess)}>
            {isMining && <div>Sending transaction...</div>}
            {isSuccess && <div>Transaction confirmed...</div>}
            {tx.transaction && tx.chainId && (
              <a target="_blank" href={getExplorerTransactionLink(tx.transaction.hash, tx.chainId)} rel="noreferrer">
                View Transaction in Explorer
              </a>
            )}
            {tx.errorMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
