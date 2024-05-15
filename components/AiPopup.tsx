import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "../lib/slices/global";
import type { RootState } from "../lib/store";

export const AiPopup = () => {
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [Response, setResponse] = React.useState("");
  const dispatch = useDispatch();

  const aiMethod = useSelector((state: RootState) => state.base.aiBackend);
  const isOpen = useSelector((state: RootState) => state.base.aiPopupOpen);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        dispatch(globalActions.setAiPopupOpen(false));
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quick Question</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Prompt</FormLabel>
            <Textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.currentTarget.value);
              }}
            />
          </FormControl>
          <Box>
            <Button
              isLoading={loading}
              onClick={() => {
                setLoading(true);
                axios
                  .post("/api/help", {
                    kind: "free",
                    method: aiMethod,
                    text: prompt,
                  })
                  .then((res) => {
                    setResponse(res.data.text);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              Send
            </Button>
          </Box>
          <Box whiteSpace={"pre-wrap"}>{Response}</Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
