import {
  Box,
  Textarea,
  TextareaProps,
  useColorModeValue,
} from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>((props, ref) => {
  const color = useColorModeValue("gray.100", "black");
  return (
    <Box
      backgroundColor={color}
      backgroundOpacity={0.5}
      p={2}
      minH="unset"
      overflow="hidden"
      w="100%"
      fontSize={"1.6rem"}
      resize="none"
      ref={ref}
      minRows={1}
      as={ResizeTextarea}
      {...props}
    />
  );
});
