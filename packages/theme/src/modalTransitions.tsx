import { forwardRef, ReactElement, Ref } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { Grow } from "@mui/material";

export const ModalGrowTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});
