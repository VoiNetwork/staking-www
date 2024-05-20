import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App/App";
import { ThemeProvider } from "@mui/material";
import { theme } from "@repo/theme";
import { ConfirmProvider } from "material-ui-confirm";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { SnackbarProvider } from "@repo/ui";
import { LoaderProvider } from "@repo/ui";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <SnackbarProvider>
          <LoaderProvider>
            <App></App>
          </LoaderProvider>
        </SnackbarProvider>
      </ConfirmProvider>
    </ThemeProvider>
  </Provider>,
);
