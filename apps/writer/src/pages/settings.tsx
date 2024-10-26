import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoStory } from "../components/NoStory";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { FileSelector } from "../components/FileSelector";
import StoryStatus from "../components/StoryStatus";

const Profile = () => {
  const storyLoaded = useSelector((store: RootState) => store.story);
  const settings = useSelector(storySettingsSelector);
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
          <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
            <FormControl>
              <FormLabel>Story Name</FormLabel>
              <Input
                value={storyLoaded.name}
                onChange={(e) => {
                  dispatch(storyActions.setName(e.currentTarget.value));
                }}
              />
              <FormHelperText>
                This is the name of the story that will be displayed in the
                reader (if you upload it).
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Header Image</FormLabel>
              <FileSelector
                value={settings?.headerImage}
                showOnlyUploaded={true}
                onChange={(value) => {
                  console.log("value", value);
                  dispatch(
                    storyActions.setSetting({
                      key: "headerImage",
                      value: value,
                    }),
                  );
                }}
              />
              <FormHelperText>
                This is the image that will be displayed at the top of the
                story.
              </FormHelperText>
            </FormControl>
            <StoryStatus storyId={storyLoaded.id} />
            <FormControl>
              <FormLabel>Instructions to give AI</FormLabel>
              <Textarea
                rows={8}
                placeholder={"Instructions"}
                value={settings?.aiInstructions}
                onChange={(e) => {
                  dispatch(
                    storyActions.setSetting({
                      key: "aiInstructions",
                      value: e.currentTarget.value,
                    }),
                  );
                }}
              />
              <FormHelperText>
                You can use this to give specific instructions to the AI for
                this story, beyond the instructions already given as part of
                every command.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Royal Road ID</FormLabel>
              <Input
                placeholder={"Royal Road ID"}
                value={settings?.royalRoadId}
                onChange={(e) => {
                  dispatch(
                    storyActions.setSetting({
                      key: "royalRoadId",
                      value: e.currentTarget.value,
                    }),
                  );
                }}
              />
              <FormHelperText>
                When this is set, and you are logged into the the online
                service, you can use the 'Import' function to import a story
                from Royal Road.
              </FormHelperText>
            </FormControl>
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Profile;
