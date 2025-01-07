import shortUUID from "short-uuid";
import { createSignal } from "solid-js";
import { searchEmbeddings } from "../lib/embeddings/embedding-store";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html.ts";
import { addNotification } from "../lib/stores/notifications";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { createSceneParagraph, scenesState, updateSceneData } from "../lib/stores/scenes";
import { settingsState } from "../lib/stores/settings";
import { useAi } from "../lib/use-ai";
import { For } from "solid-js";
import { uiState } from "../lib/stores/ui.ts";
import { charactersState } from "../lib/stores/characters";
import { locationsState } from "../lib/stores/locations";
import { findPathToNode } from "../lib/stores/tree.ts";
import { SceneParagraph } from "@writer/shared";
import { arcsStore } from "../lib/stores/arcs";

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

              const [bookNode, arcNode, chapterNode, sceneNode] = findPathToNode(scene.id);

              // Get all scenes from current chapter
              const currentChapterScenes = chapterNode.children?.map(scene => {
                return scenesState.scenes[scene.id]
              }) ?? [];

              // Get all scenes from previous chapters and arcs
              const arcs = bookNode.children ?? [];
              const currentArcIndex = arcs.findIndex(a => a.id === arcNode.id);
              const chapters = arcNode.children ?? [];
              const currentChapterIndex = chapters.findIndex(c => c.id === chapterNode.id);
              
              // Gather highlights from previous arcs and current arc
              const highlightLines: string[] = [];
              for (let i = 0; i <= currentArcIndex; i++) {
                const arc = arcs[i];
                const arcHighlights = arcsStore.arcs[arc.id]?.highlights;
                if (arcHighlights?.length) {
                  highlightLines.push(`<arc_highlights from="${arc.name}"${i === currentArcIndex ? ' current="true"' : ''}>`);
                  for (const highlight of arcHighlights) {
                    highlightLines.push(`<${highlight.category}>${highlight.text}</${highlight.category}>`);
                  }
                  highlightLines.push('</arc_highlights>');
                }
              }
              
              // Initialize array to store the last two chapters' worth of paragraphs
              const allParagraphs: SceneParagraph[] = [];
              
              // If we're in the first chapter of current arc, get last chapter from previous arc
              if (currentChapterIndex === 0 && currentArcIndex > 0) {
                const previousArc = arcs[currentArcIndex - 1];
                if (previousArc?.children?.length) {
                  const lastChapter = previousArc.children[previousArc.children.length - 1];
                  const chapterScenes = lastChapter.children?.map(scene => scenesState.scenes[scene.id]) ?? [];
                  for (const scene of chapterScenes) {
                    if (scene?.paragraphs) {
                      allParagraphs.push(...scene.paragraphs);
                    }
                  }
                }
              }
              
              // Get content from previous chapter in current arc if it exists
              if (currentChapterIndex > 0) {
                const previousChapter = chapters[currentChapterIndex - 1];
                const chapterScenes = previousChapter.children?.map(scene => scenesState.scenes[scene.id]) ?? [];
                for (const scene of chapterScenes) {
                  if (scene?.paragraphs) {
                    allParagraphs.push(...scene.paragraphs);
                  }
                }
              }
              
              // Add current chapter's content
              for (const scene of currentChapterScenes) {
                if (scene?.paragraphs) {
                  allParagraphs.push(...scene.paragraphs);
                }
              }

              const recentContentChunks: RecentContentSection[] = [];

              for (let i = 0; i < allParagraphs.length; i++) {
                const paragraph = allParagraphs[i];
                const cachedIndexesEmpty = cachedIndexes().length === 0;
                const isIndexCached = cachedIndexes().includes(i);

                recentContentChunks.push({
                  text: `\`\`\`\n${
                    typeof paragraph.text === "string"
                      ? paragraph.text
                      : contentSchemaToText(paragraph.text)
                  }\n\`\`\`\n\n`,
                  canCache: isIndexCached || (cachedIndexesEmpty && allParagraphs.length - 1 === i),
                });
              }

              const lastIndex = allParagraphs.length - 1;
              setCachedIndexes((prev) => {
                const updated = [...prev, lastIndex];
                return updated.slice(-3);
              });

              let appropriateContext;
              let sceneContent;
              let storyContent;

              // Build character and location context
              const characterLines: string[] = [];
              if (scene.protagonistId) {
                const protagonist = charactersState.characters[scene.protagonistId];
                if (protagonist) {
                  characterLines.push(
                    `<perspective>${protagonist.firstName}'s ${scene.perspective ?? "third"} person perspective - ${protagonist.summary}</perspective>`,
                  );
                }
              }
              for (const charId of scene?.characterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;
                const charText = `${[char.firstName, char.middleName, char.lastName]
                  .filter(Boolean)
                  .join(" ")}: ${char.summary}`;
                characterLines.push(`<present_character>${charText}</present_character>`);
              }
              for (const charId of scene?.referredCharacterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;
                const charText = `${[char.firstName, char.middleName, char.lastName]
                  .filter(Boolean)
                  .join(" ")}: ${char.summary}`;
                characterLines.push(
                  `<referred_character>${charText}</referred_character>`,
                );
              }

              const locationLines: string[] = [];
              if (scene?.locationId) {
                locationLines.push(
                  `<current_location>${locationsState.locations[scene.locationId].description}</current_location>`
                );
              }

              // Add chapter context
              const chapterContext = [
                `<chapter_info>`,
                `<current_chapter>${chapterNode.name}</current_chapter>`,
                currentChapterIndex > 0 ? `<previous_chapter>${chapters[currentChapterIndex - 1].name}</previous_chapter>` : '',
                `</chapter_info>`,
              ].filter(Boolean).join('\n');

              const sceneContext = {
                text: [
                  chapterContext,
                  "<scene_setup>",
                  characterLines.join("\n"),
                  locationLines.join("\n"),
                  "</scene_setup>",
                  highlightLines.length > 0 ? highlightLines.join("\n") : "",
                ].filter(Boolean).join("\n"),
                canCache: true,
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

              const promptBase = {
                text: `Write ${
                  paragraphCount() === 1
                    ? "a paragraph"
                    : `${paragraphCount()} paragraphs`
                } for the next scene in which the following happens: ${scene.generateNextText}. Do not output any other text than the paragraphs.`,
                canCache: false,
              };

              const inputSections = ragContent
                ? [...recentContentChunks, sceneContext, ragSection, promptBase]
                : [...recentContentChunks, sceneContext, promptBase];

              console.log("complete input sections", inputSections);

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
                  // replace with em dash
                  text: paragraph.replaceAll(" - ", "—"),
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
