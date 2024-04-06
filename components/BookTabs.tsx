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
import React, {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";
import axios from "axios";
import {sortedBookScenes} from "../lib/selectors/sortedBookScenes";
import {aiHelp} from "../lib/actions/aiHelp";

export const BookTabs = () => {
  const bookObj = useSelector(selectedObjectSelector);
  const orderedChapters = useSelector(sortedBookScenes)
  const dispatch = useDispatch();

    const help = useCallback((helpKind: string, extra = false) => {
        if (bookObj?.type === 'book' && orderedChapters) {
            aiHelp('critiqueStoryline', orderedChapters.join('\n\n')).then((res) => {
                dispatch(storyActions.updateBook({
                    id: bookObj.id,
                    critique: res.data.text,
                }));
            })
        }
    }, [bookObj])

  return bookObj && bookObj.type === 'book' ? <Tabs display={"flex"} flexDirection={'column'} overflow={'hidden'}>
    <TabList>
      <Tab>Overview</Tab>
    </TabList>
    <TabPanels overflow={'auto'}>
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
          <FormControl>
              <FormLabel>AI Response</FormLabel>
              <Textarea
                  mt={2}
                  onChange={(e) => {
                      dispatch(
                          storyActions.updateBook({
                              id: bookObj.id,
                              critique: e.target.value,
                          })
                      );
                  }}
                  placeholder="critique"
                  height={"300px"}
                  value={bookObj.data.critique}
              />
          </FormControl>
          <Button colorScheme={'blue'} onClick={() => {
              help('critiqueStoryline')
          }}>[AI] Critique</Button>
      </TabPanel>
    </TabPanels>
  </Tabs> : null
}