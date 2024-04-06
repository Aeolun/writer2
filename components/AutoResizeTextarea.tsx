import {Box, Textarea, TextareaProps} from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";

export const AutoResizeTextarea = React.forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>((props, ref) => {
    return (
        <Box
            bg={"gray.700"}
            p={2}
            minH="unset"
            overflow="hidden"
            w="100%"
            resize="none"
            ref={ref}
            minRows={1}
            as={ResizeTextarea}
            {...props}
        />
    );
});