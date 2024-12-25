import type { Document } from "@langchain/core/documents";
import { addDocuments, removeDocuments } from "./embedding-store.ts";
import { scenesState } from "../stores/scenes.ts";
import { charactersState } from "../stores/characters.ts";
import { locationsState } from "../stores/locations.ts";
import { storyState } from "../stores/story.ts";
import { contentSchemaToText } from "../persistence/content-schema-to-html.ts";

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

export type LocationEmbeddingMetadata = {
  locationId: string;
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
      const paragraphText =
        typeof paragraph.text === "string"
          ? paragraph.text
          : contentSchemaToText(paragraph.text);
      if (
        paragraphText.length > 0 &&
        !addCache.has(`paragraph/${paragraph.id}`)
      ) {
        documents.push({
          id: `paragraph/${paragraph.id}`,
          pageContent: paragraphText,
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
        pageContent: `${character.name} (${character.age} years old, ${character.height}cm tall): ${
          character.summary
        }. ${character.distinguishingFeatures ? `Notable features: ${character.distinguishingFeatures}.` : ""} ${
          character.hairColor
            ? `Has ${character.hairColor.toLowerCase()} hair`
            : ""
        }${character.eyeColor ? ` and ${character.eyeColor.toLowerCase()} eyes` : ""}.`,
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

  for (const [locationId, location] of Object.entries(
    locationsState.locations,
  )) {
    if (!addCache.has(`location/${locationId}`)) {
      documents.push({
        id: `location/${locationId}`,
        pageContent: `${location.name}: ${location.description}`,
        metadata: {
          locationId,
          storyId: storyId ?? "",
          kind: "context",
        } satisfies LocationEmbeddingMetadata,
      });
      addCache.add(`location/${locationId}`);
      nr++;
    }
  }

  await addDocuments(documents);
};
