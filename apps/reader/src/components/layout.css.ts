import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const wrapper = style({
  display: "flex",
  flexDirection: "column",
  padding: `0 ${vars.spacing.large}`,
  width: "70%",
  maxWidth: "1200px",
  margin: "0 auto",
});

export const menu = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.spacing.medium,
});
