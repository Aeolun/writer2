import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "../../theme.css";

export const navItem = style({
  padding: vars.spacing.small,
  backgroundColor: vars.colors.primary.background,
  color: vars.colors.primary.foreground,
});
