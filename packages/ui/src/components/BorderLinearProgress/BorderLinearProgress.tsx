import { LinearProgress, linearProgressClasses, styled } from "@mui/material";
import { ThemeColors } from "@repo/theme";

export const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 12,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: ThemeColors.PrimaryLight,
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: ThemeColors.Primary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));
