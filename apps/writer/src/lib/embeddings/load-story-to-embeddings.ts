import type { Document } from "@langchain/core/documents";
import { addDocuments, removeDocuments } from "./embedding-store.ts";
import { scenesState } from "../stores/scenes.ts";
import { charactersState } from "../stores/characters.ts";
import { storyState } from "../stores/story.ts";

const addCache = new Set<string>();

export const removeEntityFromEmbeddingsCache = (entityId: string) => {
  addCache.delete(entityId);
  removeDocuments([entityId]).catch((error) => {
    console.error("Error removing entity from embeddings", error);
  });
};

export type ParagraphEmbeddingMetadata = {
  sceneId: string;
  paragraphId: string;
  storyId: string;
  kind: "content";
};

export type CharacterEmbeddingMetadata = {
  characterId: string;
  storyId: string;
  kind: "context";
};

export const loadStoryToEmbeddings = async () => {
  const documents: Document[] = [];
  let nr = 0;

  const scenes = scenesState.scenes;
  const storyId = storyState.story?.id;

  for (const [sceneId, scene] of Object.entries(scenes)) {
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
            storyId: storyId ?? "",
            kind: "content",
          } satisfies ParagraphEmbeddingMetadata,
        });
        addCache.add(`paragraph/${paragraph.id}`);
        nr++;
      }
    }
  }

  for (const [characterId, character] of Object.entries(
    charactersState.characters,
  )) {
    if (!addCache.has(`character/${characterId}`)) {
      documents.push({
        id: `character/${characterId}`,
        pageContent: `${character.name} (${character.age} years old): ${character.summary}`,
        metadata: {
          characterId,
          storyId: storyId ?? "",
          kind: "context",
        } satisfies CharacterEmbeddingMetadata,
      });
      addCache.add(`character/${characterId}`);
      nr++;
    }
  }

  await addDocuments(documents);
};
