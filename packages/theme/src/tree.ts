import { GreyColors } from "./colors";

export const treeStyles = {
  ".MuiCollapse-root": {
    marginLeft: "0px",
  },
  ".MuiTreeItem-root": {
    "&.indent": {
      ".MuiTreeItem-content": {
        paddingLeft: "30px",
      },
    },
    ".MuiTreeItem-iconContainer": {
      ".MuiSvgIcon-root.expand-collapse": {
        fontSize: "24px",
        color: GreyColors.FormLabel,
      },
    },
    ".MuiTreeItem-content": {
      paddingTop: "8px",
      paddingBottom: "8px",
      "&.Mui-selected": {
        background: GreyColors.F8F8F9,
        ".MuiTreeItem-label": {
          color: GreyColors.FormLabel,
        },
      },
      ".MuiTreeItem-label": {
        fontSize: "14px",
        color: GreyColors.A7A9AC,
      },
    },
  },
};
