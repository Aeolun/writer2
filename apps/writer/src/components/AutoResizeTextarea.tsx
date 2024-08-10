import { Box, type TextareaProps } from "@chakra-ui/react";
import hljs from "highlight.js";
import React from "react";
import Editor from "react-simple-code-editor";

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
      as={Editor}
      highlight={(text: string) => {
        const tt = hljs.highlight(text, { language: "typst" }).value;
        console.log("typst", tt);
        return tt;
      }}
      onValueChange={(text: string) => {
        props.onChange?.({
          target: {
            value: text,
          },
          currentTarget: {
            value: text,
          },
          // biome-ignore lint/suspicious/noExplicitAny: Can't remake a whole event object here
        } as any);
      }}
      {...props}
    />
  );
});
