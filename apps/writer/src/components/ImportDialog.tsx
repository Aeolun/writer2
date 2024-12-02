import { For } from "solid-js";
import { Show } from "solid-js";
import { setImportDialogOpen, uiState } from "../lib/stores/ui";

export const ImportDialog = () => {
  return (
    <Show when={uiState.importDialog.open}>
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Importing chapters</h3>
          <Show when={uiState.importDialog.chapters}>
            <table class="table table-compact">
              <tbody>
                <For each={uiState.importDialog.chapters}>
                  {(chapter) => (
                    <tr>
                      <td>{chapter.title}</td>
                      <td>{chapter.imported ? "✅" : "❌"}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
          <Show when={uiState.importDialog.completed}>
            <button
              class="btn btn-primary"
              type="button"
              onClick={() => setImportDialogOpen(false)}
            >
              Close
            </button>
          </Show>
        </div>
      </div>
    </Show>
  );
};
