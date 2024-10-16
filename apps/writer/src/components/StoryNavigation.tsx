import { Box, Button, Flex, useColorModeValue } from "@chakra-ui/react";
import { Clock, Minus, Plus, Upload } from "iconoir-react";
import React, { Fragment } from "react";
import { type NodeRendererProps, Tree } from "react-arborist";
import { useDispatch, useSelector } from "react-redux";
import useResizeObserver from "use-resize-observer";
import { globalActions } from "../lib/slices/global";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

function Node({ node, tree, style, dragHandle }: NodeRendererProps<any>) {
  const dispatch = useDispatch();
  const selectedColor = useColorModeValue("red.500", "red.700");
  const scenes = useSelector((state: RootState) => state.story.scene);
  const chapters = useSelector((state: RootState) => state.story.chapter);
  /* This node instance can do many things. See the API reference. */
  return (
    <>
      <Flex
        bg={node.isSelected ? selectedColor : ""}
        cursor={"pointer"}
        style={style}
        ref={dragHandle}
        userSelect={"none"}
        onClick={() => {
          dispatch(globalActions.setSelectedEntity(node.data.type));
          dispatch(globalActions.setCurrentId(node.data.id));
        }}
      >
        {node.data.type !== "scene" ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              node.toggle();
              dispatch(storyActions.toggleTreeItem({ id: node.data.id }));
            }}
          >
            {node.isOpen ? <Minus /> : <Plus />}
          </div>
        ) : null}
        <Flex
          gap={2}
          style={{ flex: 1, maxHeight: "24px", overflow: "hidden" }}
        >
          <span>
            {node.data.type === "book"
              ? "📚"
              : node.data.type === "arc"
                ? "🏹"
                : node.data.type === "chapter"
                  ? "📖"
                  : node.data.type === "scene"
                    ? "📝"
                    : ""}
          </span>
          <span>{node.data.name}</span>
          {node.data.type === "chapter" ? (
            <>
              {chapters[node.data.id].visibleFrom ? (
                <div style={{ marginLeft: "auto" }}>
                  {new Date(chapters[node.data.id].visibleFrom) < new Date() ? (
                    <Upload color={"#4c4"} />
                  ) : (
                    <Clock color={"#4c4"} />
                  )}
                </div>
              ) : null}
            </>
          ) : null}
          {node.data.type === "scene" ? (
            <>
              <span style={{ fontSize: "70%" }}>
                {scenes[node.data.id].words}w
              </span>
              <span style={{ marginLeft: "auto", display: "flex" }}>
                <div>{scenes[node.data.id].hasAI ? "🤖" : "🧑"}</div>
              </span>
            </>
          ) : null}
        </Flex>
        {node.data.type !== "scene" ? (
          <div
            className={"self-end"}
            onClick={() => {
              console.log("create something");
              if (node.data.type === "book") {
                dispatch(
                  storyActions.createArc({
                    bookId: node.data.id,
                  }),
                );
              } else if (node.data.type === "arc") {
                dispatch(
                  storyActions.createChapter({
                    arcId: node.data.id,
                  }),
                );
              } else if (node.data.type === "chapter") {
                dispatch(
                  storyActions.createScene({
                    chapterId: node.data.id,
                  }),
                );
              }
            }}
          >
            <Plus />
          </div>
        ) : null}
      </Flex>
    </>
  );
}

const nodeParentTypes = {
  book: undefined,
  arc: "book",
  chapter: "arc",
  scene: "chapter",
};

export const NavTree = () => {
  const books = useSelector((state: RootState) => state.story.structure);
  const selected = useSelector((state: RootState) => state.base.currentId);
  const { ref, width, height } = useResizeObserver();
  const dispatch = useDispatch();

  return (
    <Box flex={1} ref={ref} overflow="auto">
      <Tree
        data={books}
        height={height}
        width={width}
        selection={selected}
        disableDrop={({ parentNode, dragNodes, index }) => {
          if (
            parentNode?.data?.type === nodeParentTypes[dragNodes[0].data.type]
          ) {
            return false;
          }
          return true;
        }}
        onMove={({
          dragIds,
          parentId,
          index,
        }: {
          dragIds: string[];
          parentId: string | null;
          index: number;
        }) => {
          console.log("moved");
          if (parentId) {
            dispatch(
              storyActions.moveItem({
                id: dragIds[0],
                parentId: parentId,
                index: index,
              }),
            );
          }
        }}
      >
        {Node}
      </Tree>
    </Box>
  );
};

export const StoryNavigation = (props: {}) => {
  const books = useSelector((state: RootState) => state.story.structure);
  const dispatch = useDispatch();

  return (
    <Flex
      width={"20%"}
      minWidth={"350px"}
      flexDir={"column"}
      overflow={"hidden"}
      paddingTop={2}
      boxShadow={"0px 0px 4px 4px rgba(0, 0, 0, 0.3)"}
      zIndex={4}
    >
      <NavTree />

      <Button
        onClick={() => {
          dispatch(storyActions.createBook());
        }}
      >
        Add a book
      </Button>
    </Flex>
  );
};
