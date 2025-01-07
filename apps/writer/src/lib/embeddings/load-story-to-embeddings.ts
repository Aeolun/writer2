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
  aspect: "summary" | "appearance" | "identity" | "role";
} | {
  characterId: string;
  storyId: string;
  sceneId: string;
  kind: "context";
  aspect: "action";
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
    const fullName = [character.firstName, character.middleName, character.lastName]
      .filter(Boolean)
      .join(" ");
    const displayName = character.nickname ? `${fullName} "${character.nickname}"` : fullName;

    // Basic summary and personality
    if (!addCache.has(`character/${characterId}/summary`)) {
      documents.push({
        id: `character/${characterId}/summary`,
        pageContent: `${displayName}: ${character.summary}`,
        metadata: {
          characterId,
          storyId: storyId ?? "",
          kind: "context",
          aspect: "summary",
        } satisfies CharacterEmbeddingMetadata,
      });
      addCache.add(`character/${characterId}/summary`);
      nr++;
    }

    // Physical appearance
    if (!addCache.has(`character/${characterId}/appearance`)) {
      const appearance = [
        `${displayName} is ${character.age} years old and ${character.height}cm tall`,
        character.distinguishingFeatures ? `Notable features: ${character.distinguishingFeatures}` : null,
        character.hairColor ? `Has ${character.hairColor.toLowerCase()} hair` : null,
        character.eyeColor ? `Has ${character.eyeColor.toLowerCase()} eyes` : null,
      ].filter(Boolean).join(". ");

      documents.push({
        id: `character/${characterId}/appearance`,
        pageContent: appearance,
        metadata: {
          characterId,
          storyId: storyId ?? "",
          kind: "context",
          aspect: "appearance",
        } satisfies CharacterEmbeddingMetadata,
      });
      addCache.add(`character/${characterId}/appearance`);
      nr++;
    }

    // Identity and orientation
    if (!addCache.has(`character/${characterId}/identity`)) {
      const identity = [
        character.gender ? `${displayName}'s gender is ${character.gender}` : null,
        character.sexualOrientation ? `Their sexual orientation is ${character.sexualOrientation}` : null,
      ].filter(Boolean).join(". ");

      if (identity) {
        documents.push({
          id: `character/${characterId}/identity`,
          pageContent: identity,
          metadata: {
            characterId,
            storyId: storyId ?? "",
            kind: "context",
            aspect: "identity",
          } satisfies CharacterEmbeddingMetadata,
        });
        addCache.add(`character/${characterId}/identity`);
        nr++;
      }
    }

    // Role in story
    if (!addCache.has(`character/${characterId}/role`)) {
      documents.push({
        id: `character/${characterId}/role`,
        pageContent: `${displayName} is a ${character.isMainCharacter ? "main character" : "supporting character"} in the story`,
        metadata: {
          characterId,
          storyId: storyId ?? "",
          kind: "context",
          aspect: "role",
        } satisfies CharacterEmbeddingMetadata,
      });
      addCache.add(`character/${characterId}/role`);
      nr++;
    }

    // Significant actions
    if (character.significantActions) {
      for (const action of character.significantActions) {
        const actionId = `character/${characterId}/action/${action.timestamp}`;
        if (!addCache.has(actionId)) {
          documents.push({
            id: actionId,
            pageContent: `${displayName}: ${action.action}`,
            metadata: {
              characterId,
              storyId: storyId ?? "",
              sceneId: action.sceneId,
              kind: "context",
              aspect: "action",
            } satisfies CharacterEmbeddingMetadata,
          });
          addCache.add(actionId);
          nr++;
        }
      }
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

export async function removeEntityIdsFromEmbeddings(entityIdPattern: RegExp) {
  const removableIds: string[] = [];
  addCache.forEach(value => {
    if (value.match(entityIdPattern)) {
      removableIds.push(value);
    }
    addCache.delete(value);
  })

  await removeDocuments(removableIds);
}
