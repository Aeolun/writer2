import { Box, BoxProps } from "@chakra-ui/react";

export const Link = (props: BoxProps) => {
  return <Box {...props}>{props.children}</Box>;
};
