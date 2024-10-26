import { createSignal } from "solid-js";
import { useAi } from "../lib/use-ai.ts";
import { uiState } from "../lib/stores/ui.ts";

export const AiPopup = () => {
  const [loading, setLoading] = createSignal(false);
  const [prompt, setPrompt] = createSignal("");
  const [response, setResponse] = createSignal("");

  return (
    <div class={`modal ${uiState.aiPopupOpen ? "modal-open" : ""}`}>
      <div class="modal-box">
        <h3 class="font-bold text-lg">Quick Question</h3>
        <div class="py-4">
          <label class="block text-sm font-medium text-gray-700">Prompt</label>
          <textarea
            class="textarea textarea-bordered w-full"
            value={prompt()}
            onInput={(e) => setPrompt(e.currentTarget.value)}
          />
        </div>
        <div class="modal-action">
          <button
            type="button"
            class={`btn ${loading() ? "loading" : ""}`}
            onClick={() => {
              setLoading(true);
              useAi("free", prompt(), false)
                .then((res) => {
                  if (res) {
                    setResponse(res);
                  }
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            Send
          </button>
        </div>
        <div class="whitespace-pre-wrap">{response()}</div>
      </div>
    </div>
  );
};
