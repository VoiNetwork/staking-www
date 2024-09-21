import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface InfoTooltipProps {
  title: any;
  placement?: "top" | "bottom" | "left" | "right";
}
export function InfoTooltip(props: InfoTooltipProps) {
  return (
    <Tooltip title={props.title} placement={props.placement || "top"}>
      <InfoOutlinedIcon style={{ fontSize: "16px", cursor: "pointer" }} />
    </Tooltip>
  );
}
