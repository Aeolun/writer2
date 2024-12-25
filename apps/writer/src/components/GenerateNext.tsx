import shortUUID from "short-uuid";
import { createSignal } from "solid-js";
import { searchEmbeddings } from "../lib/embeddings/embedding-store";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html.ts";
import { addNotification } from "../lib/stores/notifications";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { createSceneParagraph, updateSceneData } from "../lib/stores/scenes";
import { settingsState } from "../lib/stores/settings";
import { useAi } from "../lib/use-ai";
import { For } from "solid-js";
import { uiState } from "../lib/stores/ui.ts";

type RecentContentSection = {
  text: string;
  canCache: boolean;
};

export const GenerateNext = () => {
  const [generatingNext, setGeneratingNext] = createSignal<boolean>(false);
  const [simpleGeneration, setSimpleGeneration] = createSignal<boolean>(false);
  const [paragraphCount, setParagraphCount] = createSignal<number>(1);
  const [cachedIndexes, setCachedIndexes] = createSignal<number[]>([]);
  const [validGenerationId, setValidGenerationId] = createSignal<string | null>(
    null,
  );

  return currentScene() ? (
    <>
      <div class="flex flex-col items-start w-full gap-2 mt-2">
        <div class="flex items-center gap-4 w-full">
          <label class="flex items-center cursor-pointer gap-2">
            <input
              class="checkbox"
              type={"checkbox"}
              value="1"
              checked={simpleGeneration()}
              onChange={() => setSimpleGeneration(!simpleGeneration())}
            />
            <div>Disable RAG</div>
          </label>
          <label class="flex items-center gap-2">
            Generate:
            <select
              class="select select-bordered select-sm"
              value={paragraphCount()}
              onChange={(e) =>
                setParagraphCount(Number.parseInt(e.target.value))
              }
            >
              <For each={[1, 2, 3, 4, 5]}>
                {(num) => <option value={num}>{num}</option>}
              </For>
            </select>
            paragraphs
          </label>
        </div>
        <textarea
          class="w-full textarea textarea-bordered"
          rows={5}
          value={currentScene()?.generateNextText ?? ""}
          placeholder={"What happens in this paragraph"}
          onChange={(event) => {
            const scene = currentScene();
            if (!scene) return;
            updateSceneData(scene.id, {
              generateNextText: event.target.value,
            });
          }}
        />
        <button
          type="button"
          class="btn btn-primary"
          disabled={generatingNext()}
          onClick={() => {
            const nextParagraphValue = currentScene()?.generateNextText;
            if (!nextParagraphValue) return;
            setGeneratingNext(true);
            const generate = async () => {
              if (!nextParagraphValue) {
                return;
              }
              const scene = currentScene();
              if (!scene) return;

              const allParagraphs = scene.paragraphs;
              const recentContentChunks: RecentContentSection[] = [];
              const startIndex = Math.max(0, allParagraphs.length - 4);

              for (let i = startIndex; i < allParagraphs.length; i++) {
                const paragraph = allParagraphs[i];
                const isIndexCached = cachedIndexes().includes(i);

                recentContentChunks.push({
                  text: `\`\`\`\n${
                    typeof paragraph.text === "string"
                      ? paragraph.text
                      : contentSchemaToText(paragraph.text)
                  }\n\`\`\`\n\n`,
                  canCache: isIndexCached,
                });
              }

              const lastIndex = allParagraphs.length - 1;
              setCachedIndexes((prev) => {
                const updated = [...prev, lastIndex];
                return updated.slice(-4);
              });

              let appropriateContext;
              let sceneContent;
              let storyContent;

              const promptBase = {
                text: `Write ${
                  paragraphCount() === 1
                    ? "a paragraph"
                    : `${paragraphCount()} paragraphs`
                } for the next scene in which the following happens: ${scene.generateNextText}. Do not output any other text than the paragraphs.`,
                canCache: false,
              };

              let ragContent = "";
              if (!simpleGeneration()) {
                await loadStoryToEmbeddings();
                appropriateContext = await searchEmbeddings(
                  nextParagraphValue,
                  5,
                  (doc) => {
                    return doc.metadata.kind === "context";
                  },
                );
                storyContent = await searchEmbeddings(
                  nextParagraphValue,
                  5,
                  (doc) => {
                    return (
                      doc.metadata.kind === "content" &&
                      scene?.id !== doc.metadata.sceneId
                    );
                  },
                );

                const blockSep = "```";
                ragContent = `${
                  appropriateContext && appropriateContext.length > 0
                    ? `Relevant context (characters, locations, etc.):\n${blockSep}\n${appropriateContext
                        .map((c) => {
                          const metadata = c[0].metadata;
                          if ("characterId" in metadata) {
                            return `Character: ${c[0].pageContent}`;
                          }
                          if ("locationId" in metadata) {
                            return `Location: ${c[0].pageContent}`;
                          }
                          return c[0].pageContent;
                        })
                        .join("\n\n")}\n${blockSep}\n\n`
                    : ""
                }${
                  storyContent && storyContent.length > 0
                    ? `Relevant Story content (sorted by relevance):\n${blockSep}\n${storyContent
                        .map((c) => c[0].pageContent)
                        .join("\n\n")}\n${blockSep}\n\n`
                    : ""
                }`;
              }

              const ragSection = {
                text: ragContent,
                canCache: false,
              };

              const inputSections = ragContent
                ? [...recentContentChunks, ragSection, promptBase]
                : [...recentContentChunks, promptBase];

              console.log("complete input sections", inputSections);

              console.log("complete input", inputSections);
              const validId = shortUUID.generate();
              setValidGenerationId(validId);
              const result = await useAi(
                "next_paragraph",
                inputSections,
                false,
              );
              if (validId !== validGenerationId()) return;
              const paragraphs = result.split("\n\n");
              console.log("output", result);
              for (const paragraph of paragraphs) {
                createSceneParagraph(scene.id, {
                  id: shortUUID.generate(),
                  text: paragraph,
                  state: "ai",
                  comments: [],
                });
              }
            };
            generate()
              .catch((error) => {
                console.error(error);
                addNotification({
                  title: "Error generating next paragraph",
                  message: error.message,
                  type: "error",
                });
              })
              .finally(() => {
                setGeneratingNext(false);
              });
          }}
        >
          {generatingNext() ? <span class="loading loading-ring" /> : null}{" "}
          Generate Next Paragraph
        </button>
        {generatingNext() ? (
          <button
            type="button"
            class="btn btn-secondary"
            onClick={() => {
              setGeneratingNext(false);
              setValidGenerationId(null);
            }}
          >
            Cancel
          </button>
        ) : null}
        <p>
          Using {settingsState.aiSource} {settingsState.aiModel} Last generation
          usage:{" "}
          <For each={Object.entries(uiState.lastGenerationUsage ?? {})}>
            {([key, value]) => (
              <span>
                {key}: {value}
              </span>
            )}
          </For>
        </p>
      </div>
    </>
  ) : null;
};
