import { ModalGrowTransition } from "./modalTransitions";
import { GreyColors } from "./colors";
import { ConfirmOptions } from "material-ui-confirm";

export const confirmationProps: ConfirmOptions = {
  description: "",
  confirmationText: "Confirm",
  confirmationButtonProps: {
    color: "secondary",
    variant: "contained",
  },
  cancellationButtonProps: {
    color: "inherit",
    variant: "contained",
    className: "grey-button",
    sx: {
      marginRight: "5px",
    },
  },
  dialogProps: {
    maxWidth: "xs",
    className: "confirmation-modal",
    TransitionComponent: ModalGrowTransition,
    sx: {
      textAlign: "center",
      ".MuiDialogTitle-root": {
        color: GreyColors.FormLabel,
        marginTop: "10px",
      },
      ".MuiDialogContentText-root": {
        fontSize: "14px",
        color: GreyColors.FormLabel,
        wordBreak: "break-word",
      },
      ".MuiDialogActions-root": {
        display: "block",
        marginTop: "10px",
        marginBottom: "30px",
      },
    },
  },
  dialogActionsProps: {},
};
