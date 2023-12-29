import {FormControl, FormLabel, Input, Tab, TabList, TabPanel, TabPanels, Tabs, Textarea} from "@chakra-ui/react";
import {storyActions} from "../lib/slices/story";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectedChapterSelector} from "../lib/selectors/selectedChapterSelector";

export const ChapterTabs = () => {
  const chapterObj = useSelector(selectedChapterSelector);
  const dispatch = useDispatch();

  return chapterObj ? <Tabs>
    <TabList>
      <Tab>Overview</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input
            placeholder={"title"}
            onChange={(e) => {
              dispatch(
                storyActions.updateChapter({
                  id: chapterObj.id,
                  title: e.target.value,
                })
              );
            }}
            value={chapterObj.title}
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
                })
              );
            }}
            placeholder="summary"
            height={"300px"}
            value={chapterObj.summary}
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
                })
              );
            }}
            placeholder={"start date"}
            value={chapterObj.start_date}
          />
        </FormControl>
      </TabPanel>
    </TabPanels>
  </Tabs> : null
}