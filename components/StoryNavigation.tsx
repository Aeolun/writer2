import React, {useState, Fragment, useCallback} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import { chaptersSelector } from "../lib/selectors/chapterSelector";
import {storyActions, Book, Arc, Chapter} from "../lib/slices/story";
import {Box, Button, Flex, useColorModeValue} from "@chakra-ui/react";
import { arcSelector } from "../lib/selectors/arcSelector";
import { bookSelector } from "../lib/selectors/bookSelector";
import { Book as BookIcon, Arc3d, KeyframeAlignVertical, Plus, Minus, Keyframes, Keyframe } from 'iconoir-react';
import { NavItem } from "./NavItem";
import {chapterScenesSelector} from "../lib/selectors/chapterScenesSelector";
import {NodeRendererProps, Tree} from "react-arborist";
import {RootState} from "../lib/store";
import useResizeObserver from "use-resize-observer";
import {globalActions} from "../lib/slices/global";


const ChapterNavigation = (props: { chapter: Chapter }) => {
  const chapter = props.chapter;
  const scenes = useSelector(chapterScenesSelector(chapter.id), shallowEqual);
  const color = useColorModeValue(100, 500)
  const dispatch = useDispatch();

  return (
    <Fragment key={chapter.id}>
      <NavItem id={chapter.id} open={chapter.open} kind={'chapter'} icon={<Keyframes />} name={`${chapter.title}`} />
      {chapter.open ? (
        <Box
          borderLeftColor={`green.${color+200}`}
          borderLeftWidth={"8px"}
          borderLeftStyle={"solid"}
        >
          {scenes.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((scene) => {
            return scene ? (
              <NavItem key={scene.id} id={scene.id} open={scene.open} kind={'scene'} icon={<Keyframe />} name={`${scene.title} (${scene.text.split(" ").length})`} />
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
}
const ArcNavigation = (props: { arc: Arc }) => {
  const arc = props.arc;
  const chapters = useSelector(chaptersSelector);
  const color = useColorModeValue(100, 500)
  const dispatch = useDispatch();

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
              return <ChapterNavigation key={chapter.id} chapter={chapter} />
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

const BookNavigation = (props: { book: Book }) => {
  const book = props.book
  const color = useColorModeValue(100, 500)
  const dispatch = useDispatch();

  const arcs = useSelector(arcSelector);
  const bookArcs = book.arcs.map(arcId => {
    return arcs[arcId]
  })

  return (
    <Fragment key={book.id}>
      <NavItem id={book.id} open={book.open} kind={'book'} icon={<BookIcon />} name={`${book.title}`} />
      {book.open ? (
        <Box
          borderLeftColor={`green.${color}`}
          borderLeftWidth={"8px"}
          borderLeftStyle={"solid"}
        >
          <Box>
            {bookArcs.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).map((arc) => {
                return <ArcNavigation key={arc.id} arc={arc} />
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

function Node({ node, style, dragHandle }: NodeRendererProps<any>) {
  const dispatch = useDispatch();
  /* This node instance can do many things. See the API reference. */
  return (
      <Flex className={node.isSelected ? 'bg-red-500' : ''} style={style} ref={dragHandle} onClick={() => {
        dispatch(globalActions.setSelectedEntity(node.data.type))
        dispatch(globalActions.setCurrentId(node.data.id));
      }}>
        {node.data.type !== 'scene' ? <div onClick={e => {
          e.stopPropagation();
          node.toggle();
          dispatch(storyActions.toggleTreeItem({id: node.data.id}));
        }}>{node.isOpen ? <Minus/> : <Plus/>}</div> : null }
        {node.isLeaf ? "🍁" : "🌲"}
        {node.data.name}
      </Flex>
  );
}

const nodeParentTypes = {
    book: undefined,
    arc: 'book',
    chapter: 'arc',
    scene: 'chapter',
}

export const StoryNavigation = (props: {}) => {
  const books = useSelector((state: RootState) => state.story.structure);
  const selected = useSelector((state: RootState) => state.base.currentId);
  const { ref, width, height } = useResizeObserver();

  return (
    <Box width={"20%"} overflow={"auto"} ref={ref}>
      <Tree
        data={books}
        height={height}
        selection={selected}
        disableDrop={({parentNode, dragNodes, index}) => {
          if (parentNode?.data?.type === nodeParentTypes[dragNodes[0].data.type]) {
            return false
          }
          return true
        }}
        width={width}
        >
        {Node}
      </Tree>
    </Box>
  );
};
