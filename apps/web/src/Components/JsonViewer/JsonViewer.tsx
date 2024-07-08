import { ReactElement } from "react";
import "./JsonViewer.scss";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import ReactJson from "react-json-view";
import { copyContent, downloadJson } from "@repo/utils";

interface JsonViewerProps {
  show: boolean;
  onClose: () => void;
  json: any;
  title: string;
  fileName: string;
  collapsed?: number;
}

function JsonViewer({
  show,
  onClose,
  json,
  title,
  fileName,
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
                <div className="json-actions">
                  <div>
                    <Button
                      color={"primary"}
                      onClick={(ev) => {
                        copyContent(ev, JSON.stringify(json));
                      }}
                      variant={"outlined"}
                      size={"small"}
                    >
                      Copy
                    </Button>
                  </div>
                  <div>
                    <Button
                      color={"primary"}
                      onClick={() => {
                        downloadJson(json, `${fileName}.json`);
                      }}
                      variant={"outlined"}
                      size={"small"}
                    >
                      Download
                    </Button>
                  </div>
                </div>
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
