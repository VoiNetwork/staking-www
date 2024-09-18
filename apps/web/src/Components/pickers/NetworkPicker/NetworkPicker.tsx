import React, { ReactElement } from "react";
import "./NetworkPicker.scss";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { RootState, useAppDispatch } from "../../../Redux/store";
import { useSelector } from "react-redux";
import { NodeConnectionParams } from "@repo/algocore";
import { selectNode } from "../../../Redux/network/nodesReducer";
import { loadAccountData } from "../../../Redux/staking/userReducer";
import { useWallet } from "@txnlab/use-wallet-react";

interface NetworkPickerProps {}
function NetworkPicker(props: NetworkPickerProps): ReactElement {
  const { activeAccount } = useWallet();
  const [menuAnchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { nodes, selectedNode } = useSelector(
    (state: RootState) => state.nodes
  );

  const dispatch = useAppDispatch();

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <div className="contract-picker-wrapper">
      <div className="contract-picker-container">
        <div>
          {nodes.length > 0 && (
            <div>
              <Button
                variant="outlined"
                color="primary"
                className="blacffk-button"
                endIcon={<ArrowDropDown></ArrowDropDown>}
                onClick={(ev) => {
                  setAnchorEl(ev.currentTarget);
                }}
              >
                {selectedNode?.label || "Select Network"}
              </Button>
              <Menu
                anchorEl={menuAnchorEl}
                className="classic-menu"
                open={Boolean(menuAnchorEl)}
                disableAutoFocusItem={true}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    transform: "translateX(0px) translateY(5px) !important",
                  },
                }}
                onClose={closeMenu}
              >
                {nodes.map((node: NodeConnectionParams) => {
                  return (
                    <MenuItem
                      key={node.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        closeMenu();
                        dispatch(selectNode(node.id));
                        if (activeAccount?.address) {
                          dispatch(loadAccountData(activeAccount.address));
                        }
                      }}
                    >
                      <ListItemIcon>&nbsp;</ListItemIcon>
                      <ListItemText disableTypography>
                        {node.label}
                      </ListItemText>
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkPicker;
