import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { WriteHeaderMenu } from "./components/WriteHeaderMenu.tsx";
import { settingsStore } from "./global-settings-store.ts";
import { type LLMName, llms } from "./lib/llm/index.ts";
import { reloadTrpc } from "./lib/trpc.ts";

type FormValues = {
  openaiKey: string;
  groqKey: string;
  anthropicKey: string;
  serverUrl: string;
  aiSource: LLMName | "";
  aiModel: string;
};

const GlobalSettings = () => {
  const { setValue, formState, watch, register, handleSubmit } =
    useForm<FormValues>({
      defaultValues: {
        openaiKey: "",
        anthropicKey: "",
        groqKey: "",
        serverUrl: "https://writer.serial-experiments.com",
        aiSource: "",
        aiModel: "",
      },
    });
  const aiSource = watch("aiSource");
  const [availableModels, setAvailableModels] = React.useState<string[]>([]);
  const storageKeys: Record<string, keyof FormValues> = {
    "openai-key": "openaiKey",
    "anthropic-key": "anthropicKey",
    "groq-key": "groqKey",
    "ai-source": "aiSource",
    "ai-model": "aiModel",
    "server-url": "serverUrl",
  };
  useEffect(() => {
    for (const key of Object.keys(storageKeys)) {
      const formKey = storageKeys[key as keyof typeof storageKeys];
      settingsStore.get<string>(key).then((value) => {
        if (value) {
          setValue(formKey, value);
        }
      });
    }
  }, [setValue]);

  useEffect(() => {
    if (aiSource) {
      llms[aiSource]?.listModels().then(setAvailableModels);
    }
  }, [aiSource]);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <WriteHeaderMenu />
      <form
        onSubmit={handleSubmit(async (data) => {
          await Promise.all(
            Object.keys(storageKeys).map((key) => {
              const formKey = storageKeys[key as keyof typeof storageKeys];
              settingsStore.set(key, data[formKey]).catch((error) => {
                console.error(error);
              });
            }),
          );
          await settingsStore.save();
          reloadTrpc();
        })}
      >
        <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
          <FormControl>
            <FormLabel>AI Source</FormLabel>
            <Select {...register("aiSource")}>
              <option value={"openai"}>OpenAI</option>
              <option value={"groq"}>Groq</option>
              <option value={"anthropic"}>Anthropic</option>
              <option value={"ollama"}>Ollama</option>
            </Select>
            <FormHelperText>
              Which AI provider is used to do completions
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>AI Model</FormLabel>
            <Select {...register("aiModel")}>
              {availableModels.map((m) => {
                return (
                  <option key={m} value={m}>
                    {m}
                  </option>
                );
              })}
            </Select>
            <FormHelperText>
              Which AI provider is used to do completions
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>OpenAI key</FormLabel>
            <Input placeholder={"OpenAI Key"} {...register("openaiKey")} />
            <FormHelperText>
              Used for calling external service for AI support.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Anthropic key</FormLabel>
            <Input
              placeholder={"Anthropic Key"}
              {...register("anthropicKey")}
            />
            <FormHelperText>
              Used for calling external service for AI support.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Groq key</FormLabel>
            <Input placeholder={"Groq Key"} {...register("groqKey")} />
            <FormHelperText>
              Used for calling external service for AI support.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Server URL</FormLabel>
            <Input placeholder={"Server URL"} {...register("serverUrl")} />
            <FormHelperText>
              URL for remote functionalities like publishing and
              synchronization.
            </FormHelperText>
          </FormControl>
          <Button isDisabled={!formState.isDirty} type={"submit"}>
            Save
          </Button>
        </Flex>
      </form>
    </Flex>
  );
};

export default GlobalSettings;
