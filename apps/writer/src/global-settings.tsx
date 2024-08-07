import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { WriteHeaderMenu } from "./components/WriteHeaderMenu.tsx";
import { settingsStore } from "./global-settings-store.ts";
import { reloadTrpc } from "./lib/trpc.ts";

const GlobalSettings = () => {
  const [openaiKey, setOpenaiKey] = React.useState("");
  const [serverUrl, setServerUrl] = React.useState(
    "https://writer.serial-experiments.com",
  );
  useEffect(() => {
    settingsStore.get<string>("openai-key").then((key) => {
      if (key) {
        setOpenaiKey(key);
      }
    });
    settingsStore.get<string>("server-url").then((url) => {
      if (url) {
        setServerUrl(url);
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
              settingsStore
                .set("openai-key", e.currentTarget.value)
                .catch((error) => {
                  console.error(error);
                });
            }}
            onBlur={() => {
              settingsStore.save();
            }}
          />
          <FormHelperText>
            Used for calling external service for AI support.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Server URL</FormLabel>
          <Input
            placeholder={"Server URL"}
            value={serverUrl}
            onChange={(e) => {
              setServerUrl(e.currentTarget.value);
              settingsStore
                .set("server-url", e.currentTarget.value)
                .then(() => {
                  reloadTrpc();
                })
                .catch((error) => {
                  console.error(error);
                });
            }}
            onBlur={() => {
              settingsStore.save();
            }}
          />
          <FormHelperText>
            URL for remote functionalities like publishing and synchronization.
          </FormHelperText>
        </FormControl>
      </Flex>
    </Flex>
  );
};

export default GlobalSettings;
