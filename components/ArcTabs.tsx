import {FormControl, FormLabel, Input, Tab, TabList, TabPanel, TabPanels, Tabs, Textarea} from "@chakra-ui/react";
import {storyActions} from "../lib/slices/story";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectedArcSelector} from "../lib/selectors/selectedArcSelector";

export const ArcTabs = () => {
  const arcObj = useSelector(selectedArcSelector);
  const dispatch = useDispatch();

  return arcObj ? <Tabs>
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
                })
              );
            }}
            value={arcObj.title}
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
                })
              );
            }}
            placeholder="summary"
            height={"300px"}
            value={arcObj.summary}
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
                })
              );
            }}
            placeholder={"start date"}
            value={arcObj.start_date}
          />
        </FormControl>
      </TabPanel>
    </TabPanels>
  </Tabs> : null
}