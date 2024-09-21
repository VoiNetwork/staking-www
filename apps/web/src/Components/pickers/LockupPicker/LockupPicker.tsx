import React, { ReactElement } from "react";
import "./LockupPicker.scss";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { AccountData } from "@repo/voix";
import humanizeDuration from "humanize-duration";

interface LockupPickerProps {
  contract: AccountData;
  onSelection: (selection: AccountData) => void;
}
function LockupPicker(props: LockupPickerProps): ReactElement {
  const [menuAnchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <div className="contract-picker-wrapper">
      <div className="contract-picker-container">
        <div>
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
              {Number(props.contract.global_period) === 0
                ? "No Lockup"
                : humanizeDuration(
                    Number(props.contract.global_period) *
                      Number(props.contract.global_lockup_delay) *
                      Number(props.contract.global_period_seconds) *
                      1000,
                    { units: ["y"], round: true }
                  )}
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
              {props.contract
                ? [
                    ...new Array(
                      Number(props.contract.global_period_limit) + 1
                    ).keys(),
                  ].map((index) => {
                    return (
                      <MenuItem
                        onClick={(ev) => {
                          ev.stopPropagation();
                          ev.preventDefault();
                          closeMenu();
                          props.onSelection({
                            ...props.contract,
                            global_period: index,
                          });
                          //setSelection(index);
                        }}
                      >
                        <ListItemText
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                          disableTypography
                        >
                          <div>
                            {index === 0
                              ? "No Lockup"
                              : humanizeDuration(
                                  index *
                                    Number(props.contract.global_lockup_delay) *
                                    Number(
                                      props.contract.global_period_seconds
                                    ) *
                                    1000,
                                  { units: ["y"], round: true }
                                )}
                          </div>
                        </ListItemText>
                      </MenuItem>
                    );
                  })
                : null}
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LockupPicker;
