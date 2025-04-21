import shortUUID from "short-uuid";
import { createSignal, onMount, createEffect } from "solid-js";
import { searchEmbeddings } from "../lib/embeddings/embedding-store";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html.ts";
import { addNotification } from "../lib/stores/notifications";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { createSceneParagraph, scenesState, updateSceneData } from "../lib/stores/scenes";
import { settingsState } from "../lib/stores/settings";
import { useAi } from "../lib/use-ai";
import { For, Show } from "solid-js";
import { uiState } from "../lib/stores/ui.ts";
import { charactersState } from "../lib/stores/characters";
import { locationsState } from "../lib/stores/locations";
import { findPathToNode, getContextNodes, getStoryNodes, searchStoryNodes } from "../lib/stores/tree.ts";
import type { SceneParagraph, Node } from "@writer/shared";
import { arcsStore } from "../lib/stores/arcs";
import { retrieveRagContent, retrieveEnhancedRagContent } from "../lib/embeddings/rag-retrieval";

type RecentContentSection = {
  text: string;
  canCache: boolean;
};

type EmbeddingResult = [{
  pageContent: string;
  metadata: Record<string, string>;
}, number];

export const GenerateNext = () => {
  const [generatingNext, setGeneratingNext] = createSignal<boolean>(false);
  const [simpleGeneration, setSimpleGeneration] = createSignal<boolean>(false);
  const [paragraphCount, setParagraphCount] = createSignal<number>(1);
  const [cachedIndexes, setCachedIndexes] = createSignal<number[]>([]);
  const [validGenerationId, setValidGenerationId] = createSignal<string | null>(
    null,
  );
  const [showContextSelector, setShowContextSelector] = createSignal<boolean>(false);
  const [showRagContent, setShowRagContent] = createSignal<boolean>(false);
  const [ragContent, setRagContent] = createSignal<string>("");
  const [isSearching, setIsSearching] = createSignal<boolean>(false);
  const [useEnhancedRag, setUseEnhancedRag] = createSignal<boolean>(false);
  const [storyNodeSearchQuery, setStoryNodeSearchQuery] = createSignal<string>("");
  const [storyNodeSearchResults, setStoryNodeSearchResults] = createSignal<Node[]>([]);
  const [showStoryNodeSearch, setShowStoryNodeSearch] = createSignal<boolean>(false);

  // Get all context nodes
  const contextNodes = getContextNodes();
  const storyNodes = getStoryNodes();
  // Toggle selection of a context node
  const toggleContextNode = (nodeId: string) => {
    const scene = currentScene();
    if (!scene) return;

    const currentSelection = scene.selectedContextNodes || [];
    const newSelection = currentSelection.includes(nodeId)
      ? currentSelection.filter(id => id !== nodeId)
      : [...currentSelection, nodeId];

    // Persist selection in scene state
    updateSceneData(scene.id, {
      selectedContextNodes: newSelection,
    });
  };

  // Remove a selected context node
  const removeContextNode = (nodeId: string) => {
    const scene = currentScene();
    if (!scene) return;

    const currentSelection = scene.selectedContextNodes || [];
    const newSelection = currentSelection.filter(id => id !== nodeId);

    // Persist selection in scene state
    updateSceneData(scene.id, {
      selectedContextNodes: newSelection,
    });
  };

  // Search for story nodes when query changes
  createEffect(() => {
    const query = storyNodeSearchQuery();
    if (query.trim() === '') {
      setStoryNodeSearchResults([]);
      return;
    }

    // Debounce the search to avoid too many searches
    const timeoutId = setTimeout(() => {
      const results = searchStoryNodes(query);
      setStoryNodeSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  });

  // Search embeddings when input changes
  createEffect(() => {
    const nextParagraphValue = currentScene()?.generateNextText;
    if (!nextParagraphValue || simpleGeneration() || !showRagContent()) return;

    const searchEmbeddingsForInput = async () => {
      setIsSearching(true);
      try {
        const scene = currentScene();
        if (!scene) return;

        await loadStoryToEmbeddings();

        // Use the new RAG retrieval function
        const result = useEnhancedRag()
          ? await retrieveEnhancedRagContent(nextParagraphValue)
          : await retrieveRagContent(nextParagraphValue);

        setRagContent(typeof result === 'string' ? result : `Queries: ${result.queries.join("\n")}\n\n${result.ragContent}`);
      } catch (error: unknown) {
        console.error("Error searching embeddings:", error);
        addNotification({
          title: "Error searching embeddings",
          message: error instanceof Error ? error.message : String(error),
          type: "error",
        });
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(searchEmbeddingsForInput, 1000);
    return () => clearTimeout(timeoutId);
  });

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
          <label class="flex items-center cursor-pointer gap-2">
            <input
              class="checkbox"
              type={"checkbox"}
              value="1"
              checked={useEnhancedRag()}
              onChange={() => setUseEnhancedRag(!useEnhancedRag())}
              disabled={simpleGeneration()}
            />
            <div>Use Enhanced RAG</div>
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

        {/* Selected Context Nodes - Always Visible */}
        <div class="w-full">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold">Selected Context Nodes:</h3>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn btn-xs btn-outline"
                onClick={() => setShowStoryNodeSearch(!showStoryNodeSearch())}
              >
                {showStoryNodeSearch() ? "Hide Story Search" : "Search Story Nodes"}
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline"
                onClick={() => setShowContextSelector(!showContextSelector())}
              >
                {showContextSelector() ? "Hide Selector" : "Select More"}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-2">
            {(currentScene()?.selectedContextNodes?.length ?? 0) > 0 ? (
              <For each={currentScene()?.selectedContextNodes ?? []}>
                {(nodeId) => {
                  let node = contextNodes.find(n => n.id === nodeId);
                  if (!node) {
                    node = storyNodes.find(n => n.id === nodeId);
                  }
                  if (!node) return null;

                  return (
                    <div class={`flex items-center gap-1 ${node.nodeType === "story" ? "bg-primary/20" : "bg-secondary/20"} p-2 rounded`}>
                      <span>{node.name}</span>
                      <button
                        type="button"
                        class="btn btn-xs btn-circle btn-ghost"
                        onClick={() => removeContextNode(nodeId)}
                      >
                        ×
                      </button>
                    </div>
                  );
                }}
              </For>
            ) : (
              <div class="text-sm text-gray-500 italic">No context nodes selected</div>
            )}
          </div>
        </div>

        {/* Story Node Search */}
        <Show when={showStoryNodeSearch()}>
          <div class="w-full bg-base-200 p-4 rounded-lg mb-2">
            <h3 class="text-sm font-bold mb-2">Search Story Nodes:</h3>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Search for story nodes..."
                value={storyNodeSearchQuery()}
                onChange={(e) => setStoryNodeSearchQuery(e.target.value)}
              />

              <div class="flex flex-wrap gap-2 mt-2">
                <Show when={storyNodeSearchResults().length > 0}>
                  <For each={storyNodeSearchResults()}>
                    {(node) => (
                      <label class="flex items-center cursor-pointer gap-2 bg-base-100 p-2 rounded">
                        <input
                          class="checkbox checkbox-sm"
                          type="checkbox"
                          checked={currentScene()?.selectedContextNodes?.includes(node.id)}
                          onChange={() => toggleContextNode(node.id)}
                        />
                        <span>{node.name}</span>
                      </label>
                    )}
                  </For>
                </Show>
                <Show when={storyNodeSearchQuery().trim() !== '' && storyNodeSearchResults().length === 0}>
                  <div class="text-sm text-gray-500 italic">No story nodes found matching your search</div>
                </Show>
              </div>
            </div>
          </div>
        </Show>

        {/* Context Node Selector */}
        <Show when={showContextSelector()}>
          <div class="w-full bg-base-200 p-4 rounded-lg mb-2">
            <h3 class="text-sm font-bold mb-2">Available Context Nodes:</h3>
            <div class="flex flex-wrap gap-2">
              <For each={contextNodes}>
                {(node) => (
                  <label class="flex items-center cursor-pointer gap-2 bg-base-100 p-2 rounded">
                    <input
                      class="checkbox checkbox-sm"
                      type="checkbox"
                      checked={currentScene()?.selectedContextNodes?.includes(node.id)}
                      onChange={() => toggleContextNode(node.id)}
                    />
                    <span>{node.name}</span>
                  </label>
                )}
              </For>
            </div>
          </div>
        </Show>

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

        {/* RAG Content Toggle and Display */}
        <div class="w-full">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold">RAG Content:</h3>
            <button
              type="button"
              class="btn btn-xs btn-outline"
              onClick={() => setShowRagContent(!showRagContent())}
              disabled={simpleGeneration()}
            >
              {showRagContent() ? "Hide RAG Content" : "Show RAG Content"}
            </button>
          </div>

          <Show when={showRagContent() && !simpleGeneration()}>
            <div class="w-full bg-base-200 p-4 rounded-lg mb-2">
              {isSearching() ? (
                <div class="flex items-center justify-center py-4">
                  <span class="loading loading-ring" />
                  <span class="ml-2">Searching embeddings...</span>
                </div>
              ) : ragContent() ? (
                <pre class="whitespace-pre-wrap text-sm">{ragContent()}</pre>
              ) : (
                <div class="text-sm text-gray-500 italic">No RAG content available yet. Type in the textarea above to search.</div>
              )}
            </div>
          </Show>
        </div>

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
                  text: `\`\`\`\n${typeof paragraph.text === "string"
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

              // Build character and location context
              const characterLines: string[] = [];
              if (scene.protagonistId) {
                const protagonist = charactersState.characters[scene.protagonistId];
                if (protagonist) {
                  characterLines.push(
                    `<perspective>${protagonist.firstName}'s ${scene.perspective ?? "third"}-person perspective</perspective>`,
                  );

                  // Add comprehensive character information for the protagonist
                  const protagonistDetails = [
                    `Name: ${protagonist.firstName} ${protagonist.lastName || ""}`,
                    `Personality: ${protagonist.personality || "Not provided"}`,
                    `Personality Quirks: ${protagonist.personalityQuirks || "Not provided"}`,
                    `Likes: ${protagonist.likes || "Not provided"}`,
                    `Dislikes: ${protagonist.dislikes || "Not provided"}`,
                    `Background: ${protagonist.background || "Not provided"}`,
                    `Distinguishing Features: ${protagonist.distinguishingFeatures || "Not provided"}`,
                    `Age: ${protagonist.age || "Not provided"}`,
                    `Gender: ${protagonist.gender || "Not provided"}`,
                    `Sexual Orientation: ${protagonist.sexualOrientation || "Not provided"}`
                  ].filter(line => !line.endsWith("Not provided")).join("\n");

                  if (protagonistDetails) {
                    characterLines.push(`<protagonist_details>${protagonistDetails}</protagonist_details>`);
                  }
                  if (protagonist.writingStyle) {
                    characterLines.push(`<protagonist_writing_style>${protagonist.writingStyle}</protagonist_writing_style>`);
                  }
                }
              }
              for (const charId of scene?.characterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;

                // Basic character info for present characters
                const charText = `${[char.firstName, char.middleName, char.lastName]
                  .filter(Boolean)
                  .join(" ")}: ${char.personality}`;
                characterLines.push(`<present_character>${charText}</present_character>`);
              }
              for (const charId of scene?.referredCharacterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;

                // Basic character info for referred characters
                const charText = `${[char.firstName, char.middleName, char.lastName]
                  .filter(Boolean)
                  .join(" ")}: ${char.personality}`;
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
                '<chapter_info>',
                `<current_chapter>${chapterNode.name}</current_chapter>`,
                currentChapterIndex > 0 ? `<previous_chapter>${chapters[currentChapterIndex - 1].name}</previous_chapter>` : '',
                '</chapter_info>',
              ].filter(Boolean).join('\n');

              // Add selected context nodes
              const contextNodeLines: string[] = [];
              for (const nodeId of currentScene()?.selectedContextNodes ?? []) {
                const contextNode = contextNodes.find(node => node.id === nodeId);


                if (contextNode) {
                  const sceneData = scenesState.scenes[contextNode.id];
                  const content = sceneData.paragraphs.map(p => typeof p.text === "string" ? p.text : contentSchemaToText(p.text)).join("\n");
                  contextNodeLines.push(`<context name="${contextNode.name}">${content}</context>`);
                }

                const storyNode = storyNodes.find(node => node.id === nodeId);
                if (storyNode) {
                  const sceneData = scenesState.scenes[storyNode.id];
                  const content = sceneData.paragraphs.map(p => typeof p.text === "string" ? p.text : contentSchemaToText(p.text)).join("\n");
                  contextNodeLines.push(`<story_node_context name="${storyNode.name}">${content}</story_node_context>`);
                }
              }

              const sceneContext = {
                text: [
                  chapterContext,
                  "<scene_setup>",
                  characterLines.join("\n"),
                  locationLines.join("\n"),
                  "</scene_setup>",
                  highlightLines.length > 0 ? highlightLines.join("\n") : "",
                  contextNodeLines.length > 0 ? contextNodeLines.join("\n") : "",
                ].filter(Boolean).join("\n"),
                canCache: true,
              };

              const ragContent = !simpleGeneration() ? await (async () => {
                // Use the new RAG retrieval function
                const result = useEnhancedRag()
                  ? await retrieveEnhancedRagContent(nextParagraphValue)
                  : await retrieveRagContent(nextParagraphValue);

                return typeof result === 'string' ? result : result.ragContent;
              })() : "";

              const ragSection = {
                text: ragContent,
                canCache: false,
              };

              const promptBase = {
                text: `Write ${paragraphCount() === 1
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
