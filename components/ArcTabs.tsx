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
  Textarea
} from "@chakra-ui/react";
import {storyActions} from "../lib/slices/story";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";
import axios from "axios";
import {RootState} from "../lib/store";

export const ArcTabs = () => {
  const arcObj = useSelector(selectedObjectSelector);
  const chapters = useSelector((store: RootState) => store.story.chapter);
  const dispatch = useDispatch();

  return arcObj && arcObj.type === 'arc' ? <Tabs>
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
                })
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
                })
              );
            }}
            placeholder={"start date"}
            value={arcObj.data.start_date}
          />
        </FormControl>
        {arcObj.data.extra ? <Textarea value={arcObj.data.extra} height={"300px"} onChange={(e) => {
          dispatch(
            storyActions.updateArc({
              id: arcObj.id,
              extra: e.target.value,
            })
          );
        }} /> : null}
        <Button onClick={() => {
          axios.post('/api/help', {
            kind: 'critiqueStoryline',
            text: `Act: ${arcObj.data.summary}\n\n${arcObj.data.chapters.map(chapterId => {
              return chapters[chapterId];
            }).sort((a, b) => {
              return a.sort_order - b.sort_order;
            }).map(chapter => {
              return `${chapter.title}: ${chapter.summary}`
            }).join('\n')}`
          }).then((res) => {
            dispatch(storyActions.updateArc({
              id: arcObj.id,
              extra: `${res.data.text}`
            }));
          });
        }}>[AI] Critique storyline</Button>

      </TabPanel>
    </TabPanels>
  </Tabs> : null
}