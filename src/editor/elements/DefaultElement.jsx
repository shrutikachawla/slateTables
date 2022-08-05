import React from "react";
import { isHotkey } from "is-hotkey";
import { Typography, TypographyProps } from "@material-ui/core";

export const DefaultElement = React.forwardRef(function DefaultElement(
  props,
  ref
) {
  return <Typography ref={ref} {...props} />;
});
