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
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { storyActions } from "../lib/slices/story";
import { nodeInTree } from "../lib/selectors/nodeInTree";

export const BookTabs = () => {
  const bookObj = useSelector(selectedObjectSelector);
  const node = useSelector(nodeInTree);
  const dispatch = useDispatch();

  return bookObj && bookObj.type === "book" ? (
    <Tabs display={"flex"} flexDirection={"column"} overflow={"hidden"}>
      <TabList>
        <Tab>Overview</Tab>
      </TabList>
      <TabPanels overflow={"auto"}>
        <TabPanel>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder={"title"}
              onChange={(e) => {
                dispatch(
                  storyActions.updateBook({
                    id: bookObj.id,
                    title: e.target.value,
                  }),
                );
              }}
              value={bookObj.data.title}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Summary</FormLabel>
            <Textarea
              mt={2}
              onChange={(e) => {
                dispatch(
                  storyActions.updateBook({
                    id: bookObj.id,
                    summary: e.target.value,
                  }),
                );
              }}
              placeholder="summary"
              height={"300px"}
              value={bookObj.data.summary}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Start date</FormLabel>
            <Input
              mt={2}
              onChange={(e) => {
                dispatch(
                  storyActions.updateBook({
                    id: bookObj.id,
                    start_date: e.target.value,
                  }),
                );
              }}
              placeholder={"start date"}
              value={bookObj.data.start_date}
            />
          </FormControl>
          <FormControl>
            <FormLabel>AI Response</FormLabel>
            <Textarea
              mt={2}
              onChange={(e) => {
                dispatch(
                  storyActions.updateBook({
                    id: bookObj.id,
                    critique: e.target.value,
                  }),
                );
              }}
              placeholder="critique"
              height={"300px"}
              value={bookObj.data.critique}
            />
          </FormControl>
          <Button
            colorScheme="red"
            isDisabled={node?.children && node.children.length > 0}
            onClick={() => {
              dispatch(storyActions.deleteBook({ bookId: bookObj.id }));
            }}
          >
            Delete
          </Button>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ) : null;
};
