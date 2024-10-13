import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Input,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { ArcTabs } from "../components/ArcTabs";
import { BookTabs } from "../components/BookTabs";
import { ChapterTabs } from "../components/ChapterTabs";
import { SceneTabs } from "../components/SceneTabs";
import {
  addDocuments,
  searchEmbeddings,
} from "../lib/embeddings/embedding-store.ts";
import { loadStoryToEmbeddings } from "../lib/embeddings/load-story-to-embeddings.ts";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import {
  type SortedBookObject,
  sortedBookObjects,
} from "../lib/selectors/sortedBookObjects";
import { addNotification } from "../lib/slices/notifications.ts";
import type { RootState } from "../lib/store";
import { Paragraph } from "./Paragraph";

export const EmbedSearchPane = () => {
  const story = useSelector((store: RootState) => store.story);
  const scenes = useSelector((store: RootState) => store.story.scene);

  const [loadingEmbeddings, setIsLoadingEmbeddings] = useState(false);

  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const [testEmbedding, setTestEmbedding] = useState("");

  const [result, setResult] = useState([]);
  const backgroundColor = useColorModeValue("blue.400", "black");

  return (
    <Flex
      flex={1}
      flexDirection={"column"}
      height={"100%"}
      overflow={"hidden"}
      backgroundColor={backgroundColor}
      backgroundImage={"url(/rice-paper.png)"}
    >
      <Button
        isLoading={loadingEmbeddings}
        onClick={() => {
          setIsLoadingEmbeddings(true);
          loadStoryToEmbeddings()
            .catch((error) => {
              console.error(error);
              dispatch(
                addNotification({
                  message: error.message,
                  type: "error",
                }),
              );
            })
            .finally(() => {
              setIsLoadingEmbeddings(false);
            });
        }}
      >
        Load embeddings
      </Button>
      <Textarea
        value={testEmbedding}
        onChange={(e) => {
          setTestEmbedding(e.currentTarget.value);
        }}
      />
      <Button
        onClick={() => {
          addDocuments([
            { id: "test", pageContent: testEmbedding, metadata: {} },
          ]).catch((error) => {
            console.error(error);
            dispatch(
              addNotification({
                message: error.message,
                type: "error",
              }),
            );
          });
        }}
      >
        Test embedding
      </Button>
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          searchEmbeddings(search, 20).then((result) => {
            setResult(result);
          });
        }}
      >
        Search
      </Button>
      <Box overflow={"scroll"} whiteSpace={"pre-wrap"}>
        {JSON.stringify(result, null, 2)}
      </Box>
    </Flex>
  );
};
