import { createTheme, styled, InputBase, InputBaseProps } from "@mui/material";
import { BaseColors, GreyColors, ThemeColors } from "./colors";

export const theme = createTheme({
  shape: {
    borderRadius: 5,
  },
  palette: {
    primary: {
      main: ThemeColors.Primary,
      contrastText: BaseColors.White,
    },
    secondary: {
      main: ThemeColors.Secondary,
      contrastText: BaseColors.White,
    },
    info: {
      main: ThemeColors.Info,
      contrastText: BaseColors.White,
    },
    warning: {
      main: ThemeColors.Warning,
      contrastText: BaseColors.White,
    },
    error: {
      main: ThemeColors.Error,
      contrastText: BaseColors.White,
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: BaseColors.Black,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          ":hover": {
            boxShadow: "none",
          },
          "&.small-button": {
            padding: "0px 5px",
            ".MuiButton-startIcon": {
              margin: "0px",
            },
          },
        },
        containedPrimary: {
          ":hover": {
            background: ThemeColors.Primary,
          },
        },
        containedSecondary: {
          ":hover": {
            background: ThemeColors.Secondary,
          },
        },
        contained: {
          "&.primary-light-button": {
            background: ThemeColors.PrimaryLight,
            color: GreyColors.FormLabel,
            ":hover": {
              background: ThemeColors.PrimaryLight,
              color: GreyColors.FormLabel,
            },
          },
          "&.secondary-light-button": {
            background: ThemeColors.SecondaryLight,
            color: GreyColors.A7A9AC,
            ":hover": {
              background: ThemeColors.SecondaryLight,
              color: GreyColors.A7A9AC,
            },
          },
          "&.error-light-button": {
            background: ThemeColors.ErrorLight,
            color: GreyColors.FormLabel,
          },
          "&.black-button": {
            background: BaseColors.Black,
            color: BaseColors.White,
          },
          "&.grey-button": {
            background: GreyColors.F8F8F9,
            color: GreyColors.FormLabel,
            ":hover": {
              background: GreyColors.F8F8F9,
            },
          },
          "&.white-background-button": {
            background: BaseColors.White,
          },
        },
        outlined: {
          "&.black-button": {
            borderColor: BaseColors.Black,
            color: BaseColors.Black,
            background: BaseColors.White,
          },
          "&.secondary-light-button": {
            borderColor: ThemeColors.SecondaryLight,
            color: GreyColors.A7A9AC,
            ":hover": {
              borderColor: ThemeColors.SecondaryLight,
              color: GreyColors.A7A9AC,
            },
          },
          "&.primary-light-button": {
            borderColor: ThemeColors.PrimaryLight,
            color: GreyColors.A7A9AC,
            ":hover": {
              borderColor: ThemeColors.PrimaryLight,
              color: GreyColors.A7A9AC,
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          "&.classic-menu": {
            ".MuiMenuItem-root": {
              fontSize: "13px",
              color: GreyColors.FormLabel,
              svg: {
                color: GreyColors.FormLabel,
              },
              ".MuiListItemText-root": {
                ".MuiTypography-root": {
                  fontSize: "14px",
                },
              },
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          "&.mini-alert": {
            padding: "0px 10px",
            borderRadius: "5px",
            display: "inline-block",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            ".MuiAlert-message": {},
          },
          "&.micro-alert": {
            padding: "0px 8px",
            borderRadius: "3px",
            display: "inline-block",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            ".MuiAlert-message": {
              padding: "3px 0",
            },
          },
          "&.primary-light-alert": {
            backgroundColor: ThemeColors.PrimaryLight,
            color: GreyColors.FormValue,
          },
          "&.secondary-alert": {
            backgroundColor: ThemeColors.Secondary,
            color: BaseColors.White,
          },
          "&.secondary-light-alert": {
            backgroundColor: ThemeColors.SecondaryLight,
            color: GreyColors.FormValue,
          },
          "&.grey-alert": {
            backgroundColor: GreyColors.F8F8F9,
            color: GreyColors.A7A9AC,
          },
          "&.warning-light-alert": {
            backgroundColor: "#FAECEA",
            color: GreyColors.FormValue,
            svg: {
              color: GreyColors.FormValue,
            },
          },
          "&.error-alert": {
            backgroundColor: ThemeColors.Error,
            color: BaseColors.White,
          },
          "&.success-snack-bar": {
            backgroundColor: ThemeColors.SecondaryLight,
            color: GreyColors.FormValue,
          },
          "&.error-snack-bar": {
            backgroundColor: "#FAECEA",
            color: GreyColors.FormValue,
          },
          "&.round": {
            borderRadius: "10px",
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          "&.classic-modal": {
            ".MuiDialogTitle-root": {
              color: GreyColors.FormLabel,
              fontSize: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "middle",
              ".close-modal": {
                "&:hover": {
                  cursor: "pointer",
                },
              },
            },
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "&.classic-label": {
            fontSize: "14px",
            color: GreyColors.FormLabel,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "&.explorer-tabs": {
            "& .MuiButtonBase-root": {
              color: GreyColors.FormLabel,
            },
            "& .MuiButtonBase-root.Mui-selected": {
              color: BaseColors.Black,
            },
            "& .MuiTabs-indicator": {
              display: "flex",
              justifyContent: "center",
              backgroundColor: "transparent",
            },
            "& .MuiTabs-indicatorSpan": {
              maxWidth: 40,
              width: "100%",
              backgroundColor: BaseColors.Black,
            },
          },
          "&.black-tabs": {
            "& .MuiButtonBase-root": {
              color: GreyColors.FormLabel,
            },
            "& .MuiButtonBase-root.Mui-selected": {
              color: BaseColors.Black,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: BaseColors.Black,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "&.classic-select": {
            width: "100%",
            fontSize: "13px",
            marginTop: "5px",
            color: GreyColors.A7A9AC,
            background: GreyColors.F8F8F9,
            ".MuiInputBase-input": {
              padding: "10px",
            },
            "&:hover": {
              fieldset: {
                border: `none !important`,
              },
            },
            "&:active": {
              fieldset: {
                border: `none !important`,
              },
            },
            fieldset: {
              borderRadius: "5px",
              border: `none !important`,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.classic-input": {
            fontSize: "14px",
            color: GreyColors.A7A9AC,
            input: {
              padding: "10px",
            },
            "&:hover": {
              fieldset: {
                borderColor: GreyColors.F8F8F9,
              },
            },
            fieldset: {
              borderColor: GreyColors.F8F8F9,
            },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "&.classic-pagination": {
            ".MuiPaginationItem-root": {
              color: GreyColors.A7A9AC,
            },
            ".Mui-selected": {
              color: GreyColors.FormLabel,
              background: GreyColors.D9D9D9,
              "&:hover": {
                color: GreyColors.FormLabel,
                background: GreyColors.D9D9D9,
              },
            },
          },
        },
      },
    },
  },
});

export const ShadedInput = styled(InputBase)<InputBaseProps>(() => {
  return {
    padding: 5,
    paddingLeft: 10,
    marginTop: 5,
    border: "none",
    fontSize: "14px",
    background: GreyColors.F8F8F9,
    borderRadius: 5,
    color: GreyColors.A7A9AC,
  };
});

export const ShadedInputOutlined = styled(InputBase)<InputBaseProps>(() => {
  return {
    padding: 5,
    paddingLeft: 10,
    marginTop: 5,
    fontSize: "14px",
    borderRadius: 5,
    color: GreyColors.A7A9AC,
    border: `1px solid ${GreyColors.LightGrey}`,
    background: BaseColors.White,
  };
});
