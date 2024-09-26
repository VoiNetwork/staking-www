import React, { ReactElement, useEffect, useState } from "react";
import "./ContractPicker.scss";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { ArrowDropDown, Done } from "@mui/icons-material";
import { RootState, useAppDispatch } from "../../../Redux/store";
import { useSelector } from "react-redux";
import {
  AIRDROP_CTC_INFO,
  AIRDROP_FUNDER,
  AccountData,
  CoreStaker,
} from "@repo/voix";
import { initAccountData } from "../../../Redux/staking/userReducer";
import { theme } from "@repo/theme";

interface ContractPickerProps {
  funder?: string;
}
function ContractPicker(props: ContractPickerProps): ReactElement {
  const [menuAnchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { account } = useSelector((state: RootState) => state.user);

  const dispatch = useAppDispatch();

  const { availableContracts, data } = account;

  const funder = AIRDROP_FUNDER;
  const parent_id = AIRDROP_CTC_INFO;

  const [airdropContracts, setAirdropContracts] = useState<AccountData[]>([]);
  const [airdrop2Contracts, setAirdrop2Contracts] = useState<AccountData[]>([]);
  const [otherContracts, setOtherContracts] = useState<AccountData[]>([]);

  let contractLabel = "";
  if (data) {
    const staker = new CoreStaker(data);
    if (airdropContracts.some((ac) => ac.contractId === data.contractId)) {
      contractLabel = `Phase I: ${staker.contractId()}`;
    } else if (
      airdrop2Contracts.some((ac) => ac.contractId === data.contractId)
    ) {
      contractLabel = `Phase II: ${staker.contractId()}`;
    } else {
      contractLabel = staker.contractId().toString();
    }
  }

  useEffect(() => {
    if (!availableContracts) return;
    setAirdropContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial !== "0"
      )
    );
    setAirdrop2Contracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial === "0"
      )
    );
    setOtherContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder !== funder ||
          contract.global_parent_id !== parent_id
      )
    );
  }, [availableContracts]);

  const filteredContracts = availableContracts.filter(
    (contract) => !props.funder || contract.global_funder === props.funder
  );

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <div className="contract-picker-wrapper">
      <div className="contract-picker-container">
        <div>
          {data && filteredContracts.length > 0 && (
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
                {contractLabel}
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
function renderMenuItems(contracts: AccountData[], phaseLabel: string) {
  return contracts.map((accountData: AccountData) => {
    const staker = new CoreStaker(accountData);
    return (
      <MenuItem
        key={staker.contractId()}
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          closeMenu();
          dispatch(initAccountData(accountData));
        }}
      >
        <ListItemIcon>
          {data.contractId === staker.contractId() ? (
            <Done
              fontSize="small"
              sx={{ color: theme.palette.common.black }}
            />
          ) : (
            ""
          )}
        </ListItemIcon>
        <ListItemText disableTypography>
          {phaseLabel} {staker.contractId()}
        </ListItemText>
      </MenuItem>
    );
  });
}

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
  {renderMenuItems(airdropContracts, "Phase I:")}
  {renderMenuItems(airdrop2Contracts, "Phase II:")}
  {renderMenuItems(otherContracts, "")}
</Menu>
                {otherContracts.map((accountData: AccountData) => {
                  const staker = new CoreStaker(accountData);
                  return (
                    <MenuItem
                      key={staker.contractId()}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        closeMenu();
                        dispatch(initAccountData(accountData));
                      }}
                    >
                      <ListItemIcon>
                        {data.contractId === staker.contractId() ? (
                          <Done
                            fontSize="small"
                            sx={{ color: theme.palette.common.black }}
                          />
                        ) : (
                          ""
                        )}
                      </ListItemIcon>
                      <ListItemText disableTypography>
                        {staker.contractId()}
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

export default ContractPicker;
