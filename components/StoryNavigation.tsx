import { StoryChapter } from "./styled/StoryChapter";
import { Link } from "./styled/Link";
import { StoryScene } from "./styled/StoryScene";
import { StoryNav } from "./styled/StoryNav";
import React, { useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chaptersSelector } from "../lib/selectors/chapterSelector";
import { selectedChapterSelector } from "../lib/selectors/selectedChapterSelector";
import { globalActions } from "../lib/slices/global";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { storyActions } from "../lib/slices/story";
import { Box, Button, Flex } from "@chakra-ui/react";
import { scenesSelector } from "../lib/selectors/scenesSelector";

export const StoryNavigation = (props: {}) => {
  const selectedChapter = useSelector(selectedChapterSelector);
  const selectedScene = useSelector(selectedSceneSelector);
  const chapters = useSelector(chaptersSelector);
  const scenes = useSelector(scenesSelector);

  const dispatch = useDispatch();

  return (
    <Box width={"14%"} overflow={"auto"}>
      {Object.values(chapters).map((chapter) => {
        return (
          <Fragment key={chapter.id}>
            <Box
              bg={
                chapter.id === selectedChapter?.id ? "green.500" : "green.300"
              }
              _hover={{ bg: "green.600" }}
              cursor={"pointer"}
              p={1}
              onClick={() => {
                dispatch(globalActions.setCurrentChapter(chapter.id));
                dispatch(globalActions.setCurrentScene(undefined));
              }}
            >
              {chapter.title}
            </Box>
            {selectedChapter?.id === chapter.id ? (
              <Box
                borderLeftColor={"green.500"}
                borderLeftWidth={"8px"}
                borderLeftStyle={"solid"}
              >
                {chapter.scenes.map((sceneId) => {
                  const scene = scenes[sceneId];
                  return scene ? (
                    <Flex
                      justifyContent={"space-between"}
                      key={scene.id}
                      bg={
                        scene.id === selectedScene?.id
                          ? "green.500"
                          : "green.400"
                      }
                      p={1}
                      _hover={{ bg: "green.600" }}
                      cursor={"pointer"}
                      onClick={() => {
                        dispatch(globalActions.setCurrentScene(scene.id));
                      }}
                    >
                      <div>
                        {scene.title} ({scene.text.split(" ").length})
                      </div>
                      <Button
                        colorScheme={"red"}
                        size={"xs"}
                        onClick={() => {
                          dispatch(
                            storyActions.deleteScene({
                              chapterId: chapter.id,
                              sceneId: scene.id,
                            })
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </Flex>
                  ) : null;
                })}
                <Button
                  m={1}
                  size={"sm"}
                  colorScheme={"green"}
                  onClick={async () => {
                    dispatch(
                      storyActions.createScene({
                        chapterId: chapter.id,
                      })
                    );
                  }}
                >
                  Add scene
                </Button>
              </Box>
            ) : null}
          </Fragment>
        );
      })}
      <Button
        m={1}
        size={"sm"}
        colorScheme={"green"}
        onClick={() => {
          alert("need to re enable");
        }}
      >
        Add chapter
      </Button>
    </Box>
  );
};
