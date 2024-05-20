import { LinearProgress, linearProgressClasses, styled } from "@mui/material";
import { ThemeColors } from "@repo/theme";

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: ThemeColors.SecondaryLight,
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: ThemeColors.Secondary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));
