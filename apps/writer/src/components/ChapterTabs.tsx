import { createSignal } from "solid-js";
import moment from "moment";
import type { HelpKind } from "../lib/ai-instructions";
import { useAi } from "../lib/use-ai";
import { currentChapter } from "../lib/stores/retrieval/current-chapter";
import { deleteChapter, updateChapter } from "../lib/stores/chapters";
import { sortedObjects } from "../lib/stores/retrieval/sorted-objects";
import { publishToRoyalRoad } from "@writer/server/src/procedures/publish-to-royal-road";
import { trpc } from "../lib/trpc";
import { updateNode } from "../lib/stores/tree";
import { settingsState } from "../lib/stores/settings";
import { storyState } from "../lib/stores/story";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html";
import { FormField } from "./styled/FormField";

export const ChapterTabs = () => {
  const [selectedTab, setSelectedTab] = createSignal("overview");
  const help = (helpKind: HelpKind, extra = false) => {
    const chapterId = currentChapter()?.id;

    if (!chapterId) {
      return;
    }
    const paragraphs = sortedObjects(chapterId, true)
      ?.filter((i) => i.type === "paragraph")
      .map((i) => i.plainText)
      .join("\n\n");

    console.log("paragraphs", paragraphs);
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
  console.log("curerntChapter", currentChapter());

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
                <label class="label">Title</label>
                <input
                  class="input input-bordered"
                  placeholder="title"
                  onInput={(e) => {
                    updateChapter(currentChapter()?.id, {
                      title: e.target.value,
                    });
                    updateNode(currentChapter()?.id, {
                      name: e.target.value,
                    });
                  }}
                  value={currentChapter()?.title}
                />
              </div>
              <div class="form-control">
                <label class="label">Summary</label>
                <textarea
                  class="textarea textarea-bordered mt-2"
                  onInput={(e) => {
                    updateChapter(currentChapter()?.id, {
                      summary: e.target.value,
                    });
                  }}
                  placeholder="summary"
                  style={{ height: "300px" }}
                  value={currentChapter()?.summary}
                />
              </div>
              <div class="form-control">
                <label class="label">Start date</label>
                <input
                  class="input input-bordered mt-2"
                  onInput={(e) => {
                    updateChapter(currentChapter()?.id, {
                      start_date: e.target.value,
                    });
                  }}
                  placeholder="start date"
                  value={currentChapter()?.start_date}
                />
                <p class="text-sm text-gray-500">
                  This is the date the chapter starts in story time.
                </p>
              </div>
              {currentChapter()?.extra ? (
                <FormField label="Extra">
                  <textarea
                    class="textarea textarea-bordered"
                    onChange={(e) => {
                      updateChapter(currentChapter()?.id ?? "", {
                        extra: e.target.value,
                      });
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
                  help("spelling");
                }}
              >
                [AI] Spelling
              </button>
              <button
                type="button"
                class="btn btn-error"
                onClick={() => {
                  deleteChapter(currentChapter()?.id ?? "");
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
              <label class="label">Published At</label>
              <div class="flex items-center">
                <input
                  class="input input-bordered"
                  onInput={(e) => {
                    if (e instanceof moment) {
                      updateChapter(currentChapter()?.id, {
                        visibleFrom: e.toISOString(),
                      });
                    }
                  }}
                  value={
                    currentChapter()?.visibleFrom
                      ? new Date(currentChapter()?.visibleFrom).toISOString()
                      : undefined
                  }
                />
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={() => {
                    updateChapter(currentChapter()?.id, {
                      visibleFrom: new Date().toISOString(),
                    });
                  }}
                >
                  Set to now
                </button>
              </div>
              <p class="text-sm text-gray-500">
                This is the date the chapter will be visible in the reader
                application (or RoyalRoad, if published there).
              </p>
            </div>
            <div class="form-control">
              <label class="label">Royal Road ID</label>
              <input
                class="input input-bordered"
                onInput={(e) => {
                  updateChapter(currentChapter()?.id, {
                    royalRoadId: parseInt(e.target.value),
                  });
                }}
                value={currentChapter()?.royalRoadId?.toString()}
              />
              <p class="text-sm text-gray-500">
                If you've already published this chapter on RoyalRoad, you can
                enter the ID here.
              </p>
            </div>
            <div class="form-control">
              <button
                type="button"
                disabled={
                  !currentChapter()?.royalRoadId ||
                  !storyState.story?.settings?.royalRoadId
                }
                class="btn btn-primary"
                onClick={() => {
                  trpc.publishToRoyalRoad.mutate({
                    chapterId: currentChapter()?.id,
                  });
                }}
              >
                Publish to RoyalRoad
              </button>
              <p class="text-sm text-gray-500">
                This will publish the chapter to Royal Road.{" "}
                <span class="text-red-500">
                  WARNING: This will send your Royal Road email and password to
                  the server. It won't be stored.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
};
