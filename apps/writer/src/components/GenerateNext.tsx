import { createSignal } from "solid-js";
import { searchEmbeddings } from "../lib/embeddings/embedding-store";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { useAi } from "../lib/use-ai";
import { createSceneParagraph } from "../lib/stores/scenes";
import shortUUID from "short-uuid";

export const GenerateNext = () => {
  const scene = currentScene();
  const [nextParagraph, setNextParagraph] = createSignal<string>("");
  const [generatingNext, setGeneratingNext] = createSignal<boolean>(false);

  return scene ? (
    <>
      <div class="flex flex-col items-start w-full gap-2 mt-2">
        <textarea
          class="w-full textarea textarea-bordered"
          value={nextParagraph()}
          placeholder={"What happens in this paragraph"}
          onChange={(event) => {
            setNextParagraph(event.target.value);
          }}
        />
        <button
          type="button"
          class="btn btn-primary"
          disabled={generatingNext()}
          onClick={() => {
            const nextParagraphValue = nextParagraph();
            if (!nextParagraphValue) return;
            setGeneratingNext(true);
            const generate = async () => {
              if (!nextParagraphValue) {
                return;
              }
              await loadStoryToEmbeddings();
              const appropriateContext = await searchEmbeddings(
                nextParagraphValue,
                5,
                (doc) => {
                  return doc.metadata.kind === "context";
                },
              );
              const recentContent = scene.paragraphs.slice(
                scene.paragraphs.length - 10,
              );
              const recentContentIds = recentContent.map((p) => p.id);
              const sceneContent = await searchEmbeddings(
                nextParagraphValue,
                5,
                (doc) => {
                  return (
                    doc.metadata.kind === "content" &&
                    scene.id === doc.metadata.sceneId &&
                    !recentContentIds.includes(doc.metadata.sceneId)
                  );
                },
              );
              const storyContent = await searchEmbeddings(
                nextParagraphValue,
                5,
                (doc) => {
                  return (
                    doc.metadata.kind === "content" &&
                    scene.id !== doc.metadata.sceneId
                  );
                },
              );

              const blockSep = "```";
              const relevantContentText =
                appropriateContext.length > 0
                  ? `Relevant context (characters, locations, etc.):\n${blockSep}\n${appropriateContext
                      .map((c) => c[0].pageContent)
                      .join("\n\n")}\n${blockSep}\n\n`
                  : "";

              const sceneContentText =
                sceneContent.length > 0
                  ? `Relevant Scene content (in same scene, sorted by relevance):\n${blockSep}\n${sceneContent
                      .map((c) => c[0].pageContent)
                      .join("\n\n")}\n${blockSep}\n\n`
                  : "";
              const storyContentText =
                storyContent.length > 0
                  ? `Relevant Story content (sorted by relevance):\n${blockSep}\n${storyContent
                      .map((c) => c[0].pageContent)
                      .join("\n\n")}\n${blockSep}\n\n`
                  : "";
              const recentContentText =
                recentContent.length > 0
                  ? `Recent content (last 10 paragraphs):\n${blockSep}\n${recentContent
                      .map((c) => c.text)
                      .join("\n\n")}\n${blockSep}\n\n`
                  : "";

              const input = `${relevantContentText}${storyContentText}${sceneContentText}${recentContentText}---\n\nWrite the next scene/paragraph in which the following happens: ${nextParagraph}`;
              console.log("complete input", input);
              const result = await useAi("next_paragraph", input, false);
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
              setGeneratingNext(false);
            };
            generate().catch((error) => {
              console.error(error);
            });
          }}
        >
          Generate Next Paragraph
        </button>
      </div>
    </>
  ) : null;
};
