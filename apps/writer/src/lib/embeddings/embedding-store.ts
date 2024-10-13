import type { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { settingsStore } from "../../global-settings-store.ts";

let memoryStore: MemoryVectorStore;
export const getVectorStore = async () => {
  if (memoryStore) {
    return memoryStore;
  }
  const key = await settingsStore.get<string>("openai-key");
  if (!key) {
    throw new Error("No openai key set");
  }
  memoryStore = new MemoryVectorStore(
    new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: key,
      batchSize: 500,
      onFailedAttempt: (error) => {
        console.error("Failed attempt", error);
      },
      maxConcurrency: 5,
    }),
  );

  return memoryStore;
};

export const addDocuments = async (documents: Document[]) => {
  const store = await getVectorStore();
  return store.addDocuments(documents);
};

export const removeDocuments = async (documentIds: string[]) => {
  const store = await getVectorStore();
  return store.memoryVectors.filter(
    (doc) => !doc.id || !documentIds.includes(doc.id),
  );
};

export const searchEmbeddings = async (
  query: string,
  numResults: number,
  filter?: (doc: Document) => boolean,
) => {
  const store = await getVectorStore();
  console.log("searching embeddings", store.memoryVectors.length);
  return store.similaritySearchWithScore(query, numResults, filter);
};
