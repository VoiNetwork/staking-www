import { ReactElement } from "react";
import "./JsonViewer.scss";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import ReactJson from "react-json-view";

interface JsonViewerProps {
  show: boolean;
  onClose: () => void;
  json: any;
  title: string;
  collapsed?: number;
}

function JsonViewer({
  show,
  onClose,
  json,
  title,
  collapsed = 1,
}: JsonViewerProps): ReactElement {
  function handleClose() {
    onClose();
  }

  return (
    <div>
      {show ? (
        <Dialog
          onClose={handleClose}
          fullWidth
          open={show}
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
          className="classic-modal round"
        >
          <DialogTitle>
            <div>{title}</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="json-viewer-wrapper">
              <div className="json-viewer-container">
                <div className="json-content">
                  <ReactJson
                    src={json}
                    name={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    enableClipboard={false}
                    iconStyle={"square"}
                    collapsed={collapsed}
                  />
                </div>
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

export default JsonViewer;
