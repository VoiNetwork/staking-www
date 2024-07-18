import "./TransactionDetails.scss";

import { ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { CheckCircleOutline, Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import { BlockPackExplorer, CoreNode } from "@repo/algocore";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

type TransactionDetailProps = {
  id: string;
  show: boolean;
  msg: string;
  onClose: () => void;
};
function TransactionDetails({
  id,
  show,
  onClose,
  msg,
}: TransactionDetailProps): ReactElement {
  const { genesis, health, versionsCheck, status, ready } = useSelector(
    (state: RootState) => state.node,
  );
  const coreNodeInstance = new CoreNode(
    status,
    versionsCheck,
    genesis,
    health,
    ready,
  );

  function handleClose() {
    onClose();
  }

  return (
    <div>
      {show ? (
        <Dialog
          onClose={handleClose}
          maxWidth={"xs"}
          open={show}
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
          className="classic-modal round"
        >
          <DialogTitle>
            <div></div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="transaction-details-wrapper">
              <div className="transaction-details-container">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div className="txn">
                      <div>
                        <CheckCircleOutline
                          fontSize={"large"}
                          className="success-icon"
                        ></CheckCircleOutline>
                      </div>
                      <div className="name">Transaction successful</div>
                      <div className="msg">{msg}</div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div>
                      <Button
                        color={"secondary"}
                        variant={"contained"}
                        size={"large"}
                        className="black-button"
                        onClick={() => {
                          new BlockPackExplorer(
                            coreNodeInstance,
                          ).openTransaction(id);
                        }}
                      >
                        View transaction
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        ""
      )}
    </div>
  );
}

export default TransactionDetails;
