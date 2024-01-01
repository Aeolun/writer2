import {FormControl, FormLabel, Input, Tab, TabList, TabPanel, TabPanels, Tabs, Textarea} from "@chakra-ui/react";
import {storyActions} from "../lib/slices/story";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";

export const BookTabs = () => {
  const bookObj = useSelector(selectedObjectSelector);
  const dispatch = useDispatch();

  return bookObj && bookObj.type === 'book' ? <Tabs>
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
                storyActions.updateBook({
                  id: bookObj.id,
                  title: e.target.value,
                })
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
                })
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
                })
              );
            }}
            placeholder={"start date"}
            value={bookObj.data.start_date}
          />
        </FormControl>
      </TabPanel>
    </TabPanels>
  </Tabs> : null
}