import { Flex, Textarea, Button } from "@chakra-ui/react";
import { scene } from "../db/schema";
import { searchEmbeddings } from "../lib/embeddings/embedding-store";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings";
import { storyActions } from "../lib/slices/story";
import { useAi } from "../lib/use-ai";
import { useSelector } from "react-redux";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { useState } from "react";
import { useAppDispatch } from "../lib/store";

export const GenerateNext = () => {
  const scene = useSelector(selectedSceneSelector);
  const dispatch = useAppDispatch();
  const [nextParagraph, setNextParagraph] = useState<string>();
  const [generatingNext, setGeneratingNext] = useState<boolean>(false);

  return scene ? (
    <>
      <Flex flexDirection={"column"} alignItems={"flex-start"} w={"100%"}>
        <Textarea
          value={nextParagraph}
          placeholder={"What happens in this paragraph"}
          onChange={(event) => {
            setNextParagraph(event.target.value);
          }}
        />
        <Button
          mt={2}
          isLoading={generatingNext}
          onClick={() => {
            setGeneratingNext(true);
            const generate = async () => {
              if (!nextParagraph) {
                return;
              }
              await loadStoryToEmbeddings();
              const appropriateContext = await searchEmbeddings(
                nextParagraph,
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
                nextParagraph,
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
                nextParagraph,
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
                  ? `Relevant context (characters, locations, etc.):\n${blockSep}\n${appropriateContext.map((c) => c[0].pageContent).join("\n\n")}\n${blockSep}\n\n`
                  : "";

              const sceneContentText =
                sceneContent.length > 0
                  ? `Relevant Scene content (in same scene, sorted by relevance):\n${blockSep}\n${sceneContent.map((c) => c[0].pageContent).join("\n\n")}\n${blockSep}\n\n`
                  : "";
              const storyContentText =
                storyContent.length > 0
                  ? `Relevant Story content (sorted by relevance):\n${blockSep}\n${storyContent.map((c) => c[0].pageContent).join("\n\n")}\n${blockSep}\n\n`
                  : "";
              const recentContentText =
                recentContent.length > 0
                  ? `Recent content (last 10 paragraphs):\n${blockSep}\n${recentContent.map((c) => c.text).join("\n\n")}\n${blockSep}\n\n`
                  : "";

              const input = `${relevantContentText}${storyContentText}${sceneContentText}${recentContentText}---\n\nWrite the next scene/paragraph in which the following happens: ${nextParagraph}`;
              console.log("complete input", input);
              const result = await useAi("next_paragraph", input, false);
              const paragraphs = result.split("\n\n");
              console.log("output", result);
              for (const paragraph of paragraphs) {
                dispatch(
                  storyActions.createSceneParagraph({
                    sceneId: scene.id,
                    state: "ai",
                    text: paragraph ?? undefined,
                  }),
                );
              }
              setGeneratingNext(false);
            };
            generate().catch((error) => {
              console.error(error);
            });
          }}
        >
          Generate Next Paragraph
        </Button>
      </Flex>
    </>
  ) : null;
};
