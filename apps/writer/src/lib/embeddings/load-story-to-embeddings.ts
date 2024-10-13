import type { Document } from "@langchain/core/documents";
import type { PersistedStory } from "@writer/shared";
import { store } from "../store.ts";
import { addDocuments, removeDocuments } from "./embedding-store.ts";

const addCache = new Set<string>();

export const removeEntityFromEmbeddingsCache = (entityId: string) => {
  addCache.delete(entityId);
  removeDocuments([entityId]).catch((error) => {
    console.error("Error removing entity from embeddings", error);
  });
};

export const loadStoryToEmbeddings = async () => {
  const documents: Document[] = [];
  let nr = 0;

  const story = store.getState().story;

  for (const [sceneId, scene] of Object.entries(story.scene)) {
    for (const paragraph of scene.paragraphs) {
      if (
        paragraph.text.length > 0 &&
        !addCache.has(`paragraph/${paragraph.id}`)
      ) {
        documents.push({
          id: `paragraph/${paragraph.id}`,
          pageContent: paragraph.text,
          metadata: {
            sceneId,
            paragraphId: paragraph.id,
            storyId: story.id,
            kind: "content",
          },
        });
        addCache.add(`paragraph/${paragraph.id}`);
        nr++;
      }
    }
  }

  for (const [characterId, character] of Object.entries(story.characters)) {
    if (!addCache.has(`character/${characterId}`)) {
      documents.push({
        id: `character/${characterId}`,
        pageContent: `${character.name} (${character.age} years old): ${character.summary}`,
        metadata: {
          characterId,
          storyId: story.id,
          kind: "context",
        },
      });
      addCache.add(`character/${characterId}`);
      nr++;
    }
  }

  await addDocuments(documents);
};
