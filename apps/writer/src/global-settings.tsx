import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Store } from "@tauri-apps/plugin-store";
import React, { useEffect } from "react";
import { WriteHeaderMenu } from "./components/WriteHeaderMenu.tsx";

const store = new Store("global-settings.bin");

const GlobalSettings = () => {
  const [openaiKey, setOpenaiKey] = React.useState("");
  useEffect(() => {
    store.get<string>("openai-key").then((key) => {
      if (key) {
        setOpenaiKey(key);
      }
    });
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <WriteHeaderMenu />
      <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
        <FormControl>
          <FormLabel>OpenAI key</FormLabel>
          <Input
            placeholder={"OpenAI Key"}
            value={openaiKey}
            onChange={(e) => {
              setOpenaiKey(e.currentTarget.value);
              store.set("openai-key", e.currentTarget.value).catch((error) => {
                console.error(error);
              });
            }}
          />
          <FormHelperText>Used for calling external service.</FormHelperText>
        </FormControl>
      </Flex>
    </Flex>
  );
};

export default GlobalSettings;
