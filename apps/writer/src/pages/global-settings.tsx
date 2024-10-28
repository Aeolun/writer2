import { createEffect, createSignal } from "solid-js";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu.tsx";
import { llms } from "../lib/llm/index.ts";
import { reloadTrpc, trpc } from "../lib/trpc.ts";
import { setSetting, settingsState } from "../lib/stores/settings.ts";
import { FormField } from "../components/styled/FormField.tsx";

let lastSource: string | undefined = undefined;
let lastSetAvailableModels: any = undefined;
const GlobalSettings = () => {
  const [availableModels, setAvailableModels] = createSignal<string[]>([]);

  createEffect(async () => {
    const source = settingsState.aiSource;
    console.log(
      "aiSource",
      source,
      lastSource === source,
      lastSetAvailableModels === setAvailableModels,
    );

    if (source && source in llms) {
      console.log("updating models");
      const models = await llms[source]?.listModels();
      setAvailableModels(models ?? []);
      if (models && !models.includes(settingsState.aiModel)) {
        setSetting("aiModel", "");
      }
    }
    lastSource = source;
    lastSetAvailableModels = setAvailableModels;
  });

  return (
    <div class="flex flex-col h-full overflow-hidden">
      <WriteHeaderMenu />
      <div class="flex-1 flex flex-col p-4 gap-2 overflow-auto">
        <FormField
          label="AI Provider"
          helpText="Which AI provider is used to do completions"
        >
          <select
            class="select select-bordered"
            value={settingsState.aiSource}
            onChange={(e) => {
              setSetting(
                "aiSource",
                e.currentTarget.value as
                  | "openai"
                  | "groq"
                  | "anthropic"
                  | "ollama"
                  | "cerebras",
              );
            }}
          >
            <option value={""}>None</option>
            <option value={"openai"}>OpenAI</option>
            <option value={"groq"}>Groq</option>
            <option value={"cerebras"}>Cerebras</option>
            <option value={"anthropic"}>Anthropic</option>
            <option value={"ollama"}>Ollama</option>
          </select>
        </FormField>

        <FormField
          label="AI Model"
          helpText="Which AI model is used to do completions"
        >
          <select
            class="select select-bordered"
            value={settingsState.aiModel}
            onChange={(e) => {
              setSetting("aiModel", e.currentTarget.value);
            }}
          >
            <option value={""}>None</option>
            {availableModels().map((m) => {
              return <option value={m}>{m}</option>;
            })}
          </select>
        </FormField>

        <FormField
          label="OpenAI key"
          helpText="Used for calling external service for AI support."
        >
          <input
            class="input input-bordered"
            value={settingsState.openaiKey}
            onChange={(e) => {
              setSetting("openaiKey", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Anthropic key"
          helpText="Used for calling external service for AI support."
        >
          <input
            class="input input-bordered"
            value={settingsState.anthropicKey}
            onChange={(e) => {
              setSetting("anthropicKey", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Groq key"
          helpText="Used for calling external service for AI support."
        >
          <input
            class="input input-bordered"
            value={settingsState.groqKey}
            onChange={(e) => {
              setSetting("groqKey", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Cerebras key"
          helpText="Used for calling external service for AI support."
        >
          <input
            class="input input-bordered"
            value={settingsState.cerebrasKey}
            onChange={(e) => {
              setSetting("cerebrasKey", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Server URL"
          helpText="URL for remote functionalities like publishing and synchronization."
        >
          <input
            class="input input-bordered"
            value={settingsState.serverUrl}
            onChange={(e) => {
              setSetting("serverUrl", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Royal Road Email"
          helpText="Your username on Royal Road, this is used if you want to publish chapters there."
        >
          <input
            class="input input-bordered"
            value={settingsState.royalRoadEmail}
            onChange={(e) => {
              setSetting("royalRoadEmail", e.target.value);
            }}
          />
        </FormField>
        <FormField
          label="Royal Road Password"
          helpText="Your password on Royal Road, this is used if you want to publish chapters there."
        >
          <input
            class="input input-bordered"
            value={settingsState.royalRoadPassword}
            onChange={(e) => {
              setSetting("royalRoadPassword", e.target.value);
            }}
            type={"password"}
          />
        </FormField>
      </div>
    </div>
  );
};

export default GlobalSettings;
