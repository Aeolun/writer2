import { Box, type TextareaProps } from "@chakra-ui/react";
import hljs from "highlight.js";
import React from "react";
import TextArea from "react-textarea-autosize";

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>((props, ref) => {
  return (
    <Box
      px={6}
      py={2}
      pb={0}
      minH="unset"
      textIndent={"1em"}
      overflow="hidden"
      background={"transparent"}
      w="100%"
      fontSize={"1rem"}
      resize="none"
      ref={ref}
      minRows={1}
      as={TextArea}
      {...props}
    />
  );
});
