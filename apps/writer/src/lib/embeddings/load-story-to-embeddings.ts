import type { Document } from "@langchain/core/documents";
import type { PersistedStory } from "@writer/shared";
import { addDocuments } from "./embedding-store.ts";

export const loadStoryToEmbeddings = async (story: PersistedStory["story"]) => {
  const documents: Document[] = [];
  let nr = 0;

  for (const [sceneId, scene] of Object.entries(story.scene)) {
    for (const paragraph of scene.paragraphs) {
      if (paragraph.text.length > 0) {
        documents.push({
          id: `paragraph/${sceneId}-${paragraph.id}`,
          pageContent: paragraph.text,
          metadata: {
            sceneId,
            paragraphId: paragraph.id,
            storyId: story.id,
          },
        });
        nr++;
      }
    }
  }

  await addDocuments(documents);
};
