import { BaseColors, GreyColors, ThemeColors } from "./colors";
import { CustomPagination } from "@repo/ui";
import { LinearProgress } from "@mui/material";
import { CustomNoRowsOverlay } from "./components/datagrid/NoRowsOverlay/noRowsOverlay";

const tableMainColor = ThemeColors.PrimaryLight;
export const dataGridCellConfig = {
  sortable: false,
  editable: false,
  flex: 1,
  disableColumnMenu: true,
};

export const dataGridStyles = {
  borderRadius: "5px",
  border: "none",
  ".MuiDataGrid-columnSeparator": {
    display: "none",
  },
  ".MuiDataGrid-columnHeaderTitle": {
    color: GreyColors.FormLabel,
  },
  ".MuiDataGrid-row": {
    backgroundColor: GreyColors.F8F8F9,
  },
  ".MuiDataGrid-row:hover": {
    backgroundColor: `${GreyColors.LightGrey} !important`,
  },
  ".MuiDataGrid-cell": {
    color: GreyColors.FormLabel,
    fontSize: "13px",
    borderWidth: "3px",
    borderColor: BaseColors.White,
    ".MuiSvgIcon-root": {
      color: GreyColors.A7A9AC,
      fontSize: "16px",
    },
  },
  ".MuiDataGrid-cell:focus": {
    outline: "none",
  },
  ".MuiDataGrid-columnHeader:focus": {
    outline: "none",
  },
  ".MuiDataGrid-columnHeader": {
    background: `${tableMainColor} !important`,
    color: BaseColors.White,
  },
  ".MuiDataGrid-columnHeaders": {
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px",
    lineHeight: "45px !important",
    minHeight: "45px !important",
    maxHeight: "45px !important",
    borderColor: BaseColors.White,
    borderBottomWidth: "2px",
  },
  ".MuiDataGrid-footerContainer": {
    border: "none",
  },
};

export const dataGridMainProps = {
  sx: dataGridStyles,
  autoHeight: true,
  pagination: true,
  checkboxSelection: false,
  disableRowSelectionOnClick: true,
  initialState: {
    pagination: {
      paginationModel: {
        pageSize: 10,
      },
    },
  },
  slots: {
    pagination: CustomPagination,
    loadingOverlay: LinearProgress,
    noRowsOverlay: CustomNoRowsOverlay,
  },
  slotProps: {
    loadingOverlay: {
      sx: {
        height: "2px",
      },
    },
  },
};
