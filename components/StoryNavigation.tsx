import React, { useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chaptersSelector } from "../lib/selectors/chapterSelector";
import { selectedChapterSelector } from "../lib/selectors/selectedChapterSelector";
import { globalActions } from "../lib/slices/global";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { storyActions } from "../lib/slices/story";
import { Box, Button, Flex } from "@chakra-ui/react";
import { scenesSelector } from "../lib/selectors/scenesSelector";
import { arcSelector } from "../lib/selectors/arcSelector";
import { bookSelector } from "../lib/selectors/bookSelector";
import {RootState} from "../lib/store";
import { Book, Arc3d, KeyframeAlignVertical, Keyframes, Keyframe } from 'iconoir-react';

export const StoryNavigation = (props: {}) => {
  const selectedChapter = useSelector(selectedChapterSelector);
  const selectedScene = useSelector(selectedSceneSelector);
  const selectedBook = useSelector((store: RootState) => store.base.currentBook);
  const selectedArc = useSelector((store: RootState) => store.base.currentArc);
  const chapters = useSelector(chaptersSelector);
  const scenes = useSelector(scenesSelector);
  const books = useSelector(bookSelector);
  const arcs = useSelector(arcSelector);

  const dispatch = useDispatch();

  return (
    <Box width={"14%"} overflow={"auto"}>
      {Object.values(books).map((book) => {
        return (
          <Fragment key={book.id}>
            <Flex
              gap={2}
              alignItems={"center"}
              bg={book.id === selectedBook ? "green.500" : "green.300"}
              _hover={{ bg: "green.600" }}
              cursor={"pointer"}
              p={1}
              onClick={() => {
                dispatch(globalActions.setSelectedEntity('book'))
                dispatch(globalActions.setCurrentBook(book.id));
                dispatch(globalActions.setCurrentChapter(undefined));
                dispatch(globalActions.setCurrentScene(undefined));
              }}
            >
              <Book display={'inline-block'} /> {book.title}
            </Flex>
            {selectedBook === book.id ? (
              <Box
                borderLeftColor={"green.100"}
                borderLeftWidth={"8px"}
                borderLeftStyle={"solid"}
              >
                <Box>
                {Object.values(arcs).map((arc) => {
                  return (
                    <Fragment key={arc.id}>
                      <Flex
                        gap={2}
                        alignItems={"center"}
                        bg={arc.id === selectedArc ? "green.500" : "green.300"}
                        _hover={{ bg: "green.600" }}
                        cursor={"pointer"}
                        p={1}
                        onClick={() => {
                          dispatch(globalActions.setSelectedEntity('arc'))
                          dispatch(globalActions.setCurrentArc(arc.id));
                          dispatch(globalActions.setCurrentChapter(undefined));
                          dispatch(globalActions.setCurrentScene(undefined));
                        }}
                      >
                        <Arc3d /> {arc.title}
                      </Flex>
                      {selectedArc === arc.id ? (
                        <Box
                          borderLeftColor={"green.200"}
                          borderLeftWidth={"8px"}
                          borderLeftStyle={"solid"}
                        >
                          <Box>
                          {Object.values(chapters).map((chapter) => {
                            return (
                              <Fragment key={chapter.id}>
                                <Flex
                                  gap={2}
                                  alignItems={"center"}
                                  bg={
                                    chapter.id === selectedChapter?.id ? "green.500" : "green.300"
                                  }
                                  _hover={{ bg: "green.600" }}
                                  cursor={"pointer"}
                                  p={1}
                                  onClick={() => {
                                    dispatch(globalActions.setSelectedEntity('chapter'))
                                    dispatch(globalActions.setCurrentChapter(chapter.id));
                                    dispatch(globalActions.setCurrentScene(undefined));
                                  }}
                                >
                                  <Keyframes /> {chapter.title}
                                </Flex>
                                {selectedChapter?.id === chapter.id ? (
                                  <Box
                                    borderLeftColor={"green.300"}
                                    borderLeftWidth={"8px"}
                                    borderLeftStyle={"solid"}
                                  >
                                    {chapter.scenes.map((sceneId) => {
                                      const scene = scenes[sceneId];
                                      return scene ? (
                                        <Flex
                                          gap={2}
                                          alignItems={"center"}
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
                                            dispatch(globalActions.setSelectedEntity('scene'))
                                            dispatch(globalActions.setCurrentScene(scene.id));
                                          }}
                                        >
                                          <Keyframe />
                                          <div>
                                            {scene.title} ({scene.text.split(" ").length})
                                          </div>
                                          <Button
                                            ml={'auto'}
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
                                      bg={'green.600'}
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
                          </Box>
                          <Button
                            m={1}
                            size={"sm"}
                            colorScheme={"green"}
                            bg={"green.500"}
                            onClick={() => {
                              dispatch(storyActions.createChapter({
                                arcId: arc.id,
                              }));
                            }}
                          >
                            Add chapter
                          </Button>
                        </Box>
                      ) : null}
                    </Fragment>
                  );
                }
                )}
                </Box>
                <Button
                  m={1}
                  size={"sm"}
                  colorScheme={"green"}
                  bg={"green.400"}
                  onClick={() => {
                    dispatch(storyActions.createArc({
                      bookId: book.id,
                    }));
                  }}
                >
                  Add arc
                </Button>
              </Box>
            ) : null}
          </Fragment>
        );
}
      )}
      <Button
        m={1}
        size={"sm"}
        colorScheme={"green"}
        bg={"green.300"}
        onClick={() => {
          dispatch(storyActions.createBook({}));
        }}
      >
        Add book
      </Button>



    </Box>
  );
};
