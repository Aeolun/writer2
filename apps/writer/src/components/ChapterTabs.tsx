import { createSignal } from "solid-js";
import moment from "moment";
import type { HelpKind } from "../lib/ai-instructions";
import { useAi } from "../lib/use-ai";
import { currentChapter } from "../lib/stores/retrieval/current-chapter";
import { deleteChapter, updateChapter } from "../lib/stores/chapters";
import { sortedObjects } from "../lib/stores/retrieval/sorted-objects";
import { trpc } from "../lib/trpc";
import { updateNode } from "../lib/stores/tree";
import { settingsState } from "../lib/stores/settings";
import { storyState } from "../lib/stores/story";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html";
import { FormField } from "./styled/FormField";
import { Show } from "solid-js";
import { NodeTypeButtons } from "./NodeTypeButtons";
import { DateTimePicker } from "./DateTimePicker";

export const ChapterTabs = () => {
  const [selectedTab, setSelectedTab] = createSignal("overview");
  const help = (helpKind: "suggest_title" | "rewrite_spelling", extra = false) => {
    const chapterId = currentChapter()?.id;

    if (!chapterId) {
      return;
    }
    const paragraphs = sortedObjects(chapterId, true)
      ?.filter((i) => i.type === "paragraph")
      .map((i) => i.plainText)
      .join("\n\n");

    useAi(helpKind, paragraphs ?? "", false).then((res) => {
      if (helpKind === "suggest_title") {
        updateChapter(chapterId, {
          title: res ?? undefined,
        });
        updateNode(chapterId, {
          name: res ?? undefined,
        });
      } else {
        updateChapter(chapterId, {
          extra: res,
        });
      }
    });
  };

  // Format the date properly to avoid undefined
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  // Get the current date for the DateTimePicker
  const getCurrentDate = () => {
    const dateString = currentChapter()?.visibleFrom;
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch (e) {
      return new Date();
    }
  };

  // Handle date selection from the DateTimePicker
  const handleDateChange = (date: Date) => {
    const chapterId = currentChapter()?.id;
    if (chapterId) {
      updateChapter(chapterId, {
        visibleFrom: date.toISOString(),
      });
    }
  };

  return currentChapter() ? (
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="tabs tabs-bordered">
        <button
          type="button"
          class={`tab ${selectedTab() === "overview" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          class={`tab ${selectedTab() === "publishing" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("publishing")}
        >
          Publishing
        </button>
      </div>
      {selectedTab() === "overview" && (
        <div class="flex flex-col flex-1 overflow-hidden">
          <div class="flex-1 p-0 overflow-hidden">
            <div class="flex-1 p-4 h-full overflow-auto">
              <div>ID: {currentChapter()?.id}</div>
              <div class="form-control">
                <label class="label" for="chapter-title">Title</label>
                <input
                  id="chapter-title"
                  class="input input-bordered"
                  placeholder="title"
                  onInput={(e) => {
                    const chapterId = currentChapter()?.id;
                    if (chapterId) {
                      updateChapter(chapterId, {
                        title: e.target.value,
                      });
                      updateNode(chapterId, {
                        name: e.target.value,
                      });
                    }
                  }}
                  value={currentChapter()?.title ?? ""}
                />
              </div>
              <div class="form-control">
                <label class="label" for="chapter-summary">Summary</label>
                <textarea
                  id="chapter-summary"
                  class="textarea textarea-bordered mt-2"
                  onInput={(e) => {
                    const chapterId = currentChapter()?.id;
                    if (chapterId) {
                      updateChapter(chapterId, {
                        summary: e.target.value,
                      });
                      updateNode(chapterId, {
                        oneliner: e.target.value,
                      });
                    }
                  }}
                  placeholder="summary"
                  style={{ height: "300px" }}
                  value={currentChapter()?.summary ?? ""}
                />
              </div>
              <div class="form-control">
                <label class="label" for="chapter-start-date">Start date</label>
                <input
                  id="chapter-start-date"
                  class="input input-bordered mt-2"
                  onInput={(e) => {
                    const chapterId = currentChapter()?.id;
                    if (chapterId) {
                      updateChapter(chapterId, {
                        start_date: e.target.value,
                      });
                    }
                  }}
                  placeholder="start date"
                  value={currentChapter()?.start_date ?? ""}
                />
                <p class="text-sm text-gray-500">
                  This is the date the chapter starts in story time.
                </p>
              </div>
              <Show when={currentChapter()?.id}>
                {(id) => <NodeTypeButtons nodeId={id()} />}
              </Show>
              {currentChapter()?.extra ? (
                <FormField label="Extra">
                  <textarea
                    class="textarea textarea-bordered"
                    onChange={(e) => {
                      const chapterId = currentChapter()?.id;
                      if (chapterId) {
                        updateChapter(chapterId, {
                          extra: e.target.value,
                        });
                      }
                    }}
                    rows={18}
                    placeholder="extra"
                    style={{ width: "100%" }}
                    value={currentChapter()?.extra ?? ""}
                  />
                </FormField>
              ) : null}
              <button
                type="button"
                class="btn btn-blue"
                onClick={() => {
                  help("suggest_title");
                }}
              >
                [AI] Suggest title
              </button>
              <button
                type="button"
                class="btn btn-blue"
                onClick={() => {
                  help("rewrite_spelling");
                }}
              >
                [AI] Spelling
              </button>
              <button
                type="button"
                class="btn btn-error"
                onClick={() => {
                  const chapterId = currentChapter()?.id;
                  if (chapterId) {
                    deleteChapter(chapterId);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedTab() === "publishing" && (
        <div class="flex-1 p-0 overflow-hidden">
          <div class="flex-1 p-4 h-full overflow-auto">
            <div class="form-control">
              <DateTimePicker
                label="Published At"
                value={currentChapter()?.visibleFrom}
                onChange={(date) => {
                  const chapter = currentChapter();
                  if (chapter) {
                    updateChapter(chapter.id, {
                      ...chapter,
                      visibleFrom: date.toISOString(),
                    });
                  }
                }}
                helpText="This is the date and time the chapter will be visible to readers."
                id={`chapter-${currentChapter()?.id}-publish-date`}
                class="w-full"
              />
              <button
                type="button"
                class="btn btn-sm btn-primary mt-2"
                onClick={() => {
                  const chapter = currentChapter();
                  if (chapter) {
                    updateChapter(chapter.id, {
                      ...chapter,
                      visibleFrom: new Date().toISOString(),
                    });
                  }
                }}
              >
                Set to now
              </button>
            </div>

            {/* Royal Road Publishing Settings */}
            <div class="card bg-base-300 p-4 mb-4 mt-4">
              <h3 class="text-lg font-bold mb-2">Royal Road</h3>
              <div class="form-control">
                <label class="label" for="royalroad-id">Royal Road ID</label>
                <input
                  id="royalroad-id"
                  class="input input-bordered"
                  onInput={(e) => {
                    const chapterId = currentChapter()?.id;
                    if (chapterId) {
                      const value = e.target.value;
                      if (value) {
                        updateChapter(chapterId, {
                          royalRoadId: Number.parseInt(value, 10),
                        });
                      } else {
                        updateChapter(chapterId, {
                          royalRoadId: undefined,
                        });
                      }
                    }
                  }}
                  value={currentChapter()?.royalRoadId?.toString() ?? ""}
                />
                <p class="text-sm text-gray-500">
                  If you've already published this chapter on Royal Road, you can
                  enter the ID here.
                </p>
              </div>

              <div class="mt-4">
                <p class="text-sm text-gray-500">
                  To publish to Royal Road, use the main "Publish" button in the header menu.
                  Your Royal Road credentials are stored locally and only sent to Royal Road
                  during the publishing process.
                </p>
              </div>
            </div>

            {/* Add more publishing platforms here as they are supported */}
          </div>
        </div>
      )}
    </div>
  ) : (
    "No chapter selected"
  );
};
