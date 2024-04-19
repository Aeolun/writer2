import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

export const ArcTabs = () => {
  const arcObj = useSelector(selectedObjectSelector);
  const bookObjs = useSelector((store: RootState) => store.story.book);
  const chapters = useSelector((store: RootState) => store.story.chapter);
  const dispatch = useDispatch();

  return arcObj && arcObj.type === "arc" ? (
    <Tabs>
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
                  storyActions.updateArc({
                    id: arcObj.id,
                    title: e.target.value,
                  }),
                );
              }}
              value={arcObj?.data.title}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Summary</FormLabel>
            <Textarea
              mt={2}
              onChange={(e) => {
                dispatch(
                  storyActions.updateArc({
                    id: arcObj.id,
                    summary: e.target.value,
                  }),
                );
              }}
              placeholder="summary"
              height={"300px"}
              value={arcObj.data.summary}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Start date</FormLabel>
            <Input
              mt={2}
              onChange={(e) => {
                dispatch(
                  storyActions.updateArc({
                    id: arcObj.id,
                    start_date: e.target.value,
                  }),
                );
              }}
              placeholder={"start date"}
              value={arcObj.data.start_date}
            />
          </FormControl>
          {arcObj.data.extra ? (
            <Textarea
              value={arcObj.data.extra}
              height={"300px"}
              onChange={(e) => {
                dispatch(
                  storyActions.updateArc({
                    id: arcObj.id,
                    extra: e.target.value,
                  }),
                );
              }}
            />
          ) : null}
          <Button
            onClick={() => {
              alert("not implementeed");
            }}
          >
            [AI] Critique storyline
          </Button>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ) : null;
};
