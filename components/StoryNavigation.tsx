import React, { useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chaptersSelector } from "../lib/selectors/chapterSelector";
import { storyActions } from "../lib/slices/story";
import {Box, Button, Flex, useColorModeValue} from "@chakra-ui/react";
import { scenesSelector } from "../lib/selectors/scenesSelector";
import { arcSelector } from "../lib/selectors/arcSelector";
import { bookSelector } from "../lib/selectors/bookSelector";
import { Book, Arc3d, KeyframeAlignVertical, Plus, Minus, Keyframes, Keyframe } from 'iconoir-react';
import { NavItem } from "./NavItem";

export const StoryNavigation = (props: {}) => {
  const chapters = useSelector(chaptersSelector);
  const scenes = useSelector(scenesSelector);
  const books = useSelector(bookSelector);
  const arcs = useSelector(arcSelector);

  const dispatch = useDispatch();
  const color = useColorModeValue(100, 500)

  return (
    <Box width={"20%"} overflow={"auto"}>
      {Object.values(books).sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((book) => {
        const bookArcs = book.arcs.map((arcId) => {
          return arcs[arcId];
        });
        return (
          <Fragment key={book.id}>
            <NavItem id={book.id} open={book.open} kind={'book'} icon={<Book />} name={`${book.title}`} />
            {book.open ? (
              <Box
                borderLeftColor={`green.${color}`}
                borderLeftWidth={"8px"}
                borderLeftStyle={"solid"}
              >
                <Box>
                {bookArcs.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((arc) => {
                  const arcChapters = arc.chapters.map((chapterId) => {
                    return chapters[chapterId];
                  });
                  return (
                    <Fragment key={arc.id}>
                      <NavItem id={arc.id} open={arc.open} kind={'arc'} icon={<Arc3d />} name={`${arc.title}`} />
                      {arc.open ? (
                        <Box
                          borderLeftColor={`green.${color+100}`}
                          borderLeftWidth={"8px"}
                          borderLeftStyle={"solid"}
                        >
                          <Box>
                          {arcChapters.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((chapter) => {
                            const chapterScenes = chapter.scenes.map((sceneId) => {
                              return scenes[sceneId];
                            });
                            return (
                              <Fragment key={chapter.id}>
                                <NavItem id={chapter.id} open={chapter.open} kind={'chapter'} icon={<Keyframes />} name={`${chapter.title}`} />
                                {chapter.open ? (
                                  <Box
                                    borderLeftColor={`green.${color+200}`}
                                    borderLeftWidth={"8px"}
                                    borderLeftStyle={"solid"}
                                  >
                                    {chapterScenes.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((scene) => {
                                      return scene ? (
                                        <NavItem id={scene.id} open={scene.open} kind={'scene'} icon={<Keyframe />} name={`${scene.title} (${scene.text.split(" ").length})`} />
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
                            bg={`green.${color+300}`}
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
                  bg={`green.${color+200}`}
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
        bg={`green.${color+200}`}
        onClick={() => {
          dispatch(storyActions.createBook({}));
        }}
      >
        Add book
      </Button>



    </Box>
  );
};
