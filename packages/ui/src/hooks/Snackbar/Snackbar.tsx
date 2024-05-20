import { createContext, useContext, useState } from "react";
import "./Snackbar.scss";
import { Alert, AlertColor, Slide, Snackbar } from "@mui/material";
import { getExceptionMsg } from "@repo/utils";

interface SnackbarState {
  visible: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

interface SnackbarContextType {
  snackbar: SnackbarState;
  showSnack: (message: string, severity: AlertColor, duration?: number) => void;
  hideSnack: () => void;
  showException: (e: any) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

const getExtraClass = (severity: string): string => {
  if (severity === "success") return "success-snack-bar";
  if (severity === "error") return "error-snack-bar";

  return "";
};

export function SnackbarProvider({ children }: any) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    severity: "info",
    duration: 5000,
  });

  const showSnack = (
    message: string,
    severity: AlertColor,
    duration: number = 5000,
  ) => {
    setSnackbar({ visible: true, message, severity, duration });
  };

  const hideSnack = () => {
    setSnackbar({ ...snackbar, visible: false, message: "" });
  };

  const showException = (e: any) => {
    console.log(e);
    const msg = getExceptionMsg(e);
    if (msg) {
      showSnack(msg, "error");
    }
  };

  const handleClose = () => {
    hideSnack();
  };

  const extraClass = getExtraClass(snackbar.severity);

  const loaderUI = snackbar.visible ? (
    <Snackbar
      open={snackbar.visible}
      autoHideDuration={snackbar.duration}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onClose={handleClose}
      TransitionComponent={(props) => <Slide {...props} direction="left" />}
    >
      <Alert
        icon={false}
        className={`chip custom-snack-bar ${extraClass}`}
        severity={snackbar.severity}
        onClose={handleClose}
      >
        <span>{snackbar.message}</span>
      </Alert>
    </Snackbar>
  ) : null;

  return (
    <SnackbarContext.Provider
      value={{ snackbar, showSnack, hideSnack, showException }}
    >
      {children}
      {loaderUI}
    </SnackbarContext.Provider>
  );
}
