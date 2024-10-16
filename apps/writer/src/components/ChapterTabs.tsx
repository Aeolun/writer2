import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
} from "@chakra-ui/react";
import moment from "moment";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { storyActions } from "../lib/slices/story";

import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { sortedBookObjects } from "../lib/selectors/sortedBookObjects";
import { HelpKind } from "../lib/ai-instructions";
import { useAi } from "../lib/use-ai";
import "react-datetime/css/react-datetime.css";
import Datetime from "react-datetime";

export const ChapterTabs = () => {
  const chapterObj = useSelector(selectedObjectSelector);
  const dispatch = useDispatch();
  const sortedBook = useSelector(sortedBookObjects);

  const help = useCallback(
    (helpKind: HelpKind, extra = false) => {
      if (chapterObj?.type === "chapter") {
        const paragraphs = sortedBook
          ?.filter((i) => i.type === "paragraph")
          .map((i) => i.text)
          .join("\n\n");

        useAi(helpKind, paragraphs ?? "", false).then((res) => {
          if (helpKind === "suggest_title") {
            dispatch(
              storyActions.updateChapter({
                id: chapterObj?.id,
                title: res ?? undefined,
              }),
            );
          } else {
            dispatch(
              storyActions.updateChapter({
                id: chapterObj?.id,
                extra: res,
              }),
            );
          }
        });
      }
    },
    [chapterObj],
  );

  return chapterObj && chapterObj.data && chapterObj.type === "chapter" ? (
    <Tabs
      display={"flex"}
      overflow={"hidden"}
      flexDirection={"column"}
      flex={1}
    >
      <TabList>
        <Tab>Overview</Tab>
        <Tab>Publishing</Tab>
      </TabList>
      <TabPanels
        flex={1}
        overflow={"hidden"}
        display={"flex"}
        flexDirection={"column"}
      >
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <Box flex={1} p={4} height="100%" overflow="auto">
            <Box>ID: {chapterObj.id}</Box>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder={"title"}
                onChange={(e) => {
                  dispatch(
                    storyActions.updateChapter({
                      id: chapterObj.id,
                      title: e.target.value,
                    }),
                  );
                }}
                value={chapterObj.data.title}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Summary</FormLabel>
              <Textarea
                mt={2}
                onChange={(e) => {
                  dispatch(
                    storyActions.updateChapter({
                      id: chapterObj.id,
                      summary: e.target.value,
                    }),
                  );
                }}
                placeholder="summary"
                height={"300px"}
                value={chapterObj.data.summary}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Start date</FormLabel>
              <Input
                mt={2}
                onChange={(e) => {
                  dispatch(
                    storyActions.updateChapter({
                      id: chapterObj.id,
                      start_date: e.target.value,
                    }),
                  );
                }}
                placeholder={"start date"}
                value={chapterObj.data.start_date}
              />
              <FormHelperText>
                This is the date the chapter starts in story time.
              </FormHelperText>
            </FormControl>
            <pre>{chapterObj.data.extra}</pre>
            <Button
              colorScheme={"blue"}
              onClick={() => {
                help("suggest_title");
              }}
            >
              [AI] Suggest title
            </Button>
            <Button
              colorScheme={"blue"}
              onClick={() => {
                help("spelling");
              }}
            >
              [AI] Spelling
            </Button>
            <Button
              colorScheme={"red"}
              onClick={() => {
                dispatch(
                  storyActions.deleteChapter({ chapterId: chapterObj.id }),
                );
              }}
            >
              Delete
            </Button>
          </Box>
        </TabPanel>
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <Box flex={1} p={4} height="100%" overflow="auto">
            <FormControl>
              <FormLabel>Published At</FormLabel>
              <Datetime
                renderInput={(props) => <Input {...props} />}
                onChange={(e) => {
                  if (e instanceof moment) {
                    dispatch(
                      storyActions.updateChapter({
                        id: chapterObj.id,
                        visibleFrom: e.toISOString(),
                      }),
                    );
                  }
                }}
                value={
                  chapterObj.data.visibleFrom
                    ? new Date(chapterObj.data.visibleFrom)
                    : undefined
                }
              />
              <FormHelperText>
                This is the date the chapter will be visible in the reader
                application (or RoyalRoad, if published there).
              </FormHelperText>
            </FormControl>
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ) : null;
};
