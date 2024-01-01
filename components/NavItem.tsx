import {globalActions} from "../lib/slices/global";
import {Keyframe, Minus, Plus, ArrowUp, ArrowDown} from "iconoir-react";
import {Button, Flex} from "@chakra-ui/react";
import {storyActions} from "../lib/slices/story";
import React, {ReactElement} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../lib/store";

export const NavItem = (props: {
  id: string
  kind: 'scene' | 'chapter' | 'arc' | 'book'
  open: boolean
  name: string
  icon: ReactElement
}) => {
  const currentSelectedId = useSelector((store: RootState) => store.base.currentId);
  const dispatch = useDispatch();

  return <Flex
    gap={2}
    alignItems={"center"}
    key={props.id}
    bg={
      props.id === currentSelectedId
        ? "green.500"
        : "green.400"
    }
    p={1}
    _hover={{bg: "green.600"}}
    cursor={"pointer"}
    onClick={() => {
      dispatch(globalActions.setSelectedEntity(props.kind))
      dispatch(globalActions.setCurrentId(props.id));
    }}
  >
    {props.kind !== 'scene' ? <div onClick={e => {
      e.stopPropagation();
      dispatch(storyActions.toggleTreeItem({id: props.id}));
    }}>{props.open ? <Minus/> : <Plus/>}</div> : null }
    {props.icon}
    <div>
      {props.name}
    </div>
    <Flex gap={1} ml={'auto'}>
    <Button
      colorScheme={"blue"}
      size={"xs"}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(
          storyActions.sortItem({
            id: props.id,
            kind: props.kind,
            direction: 'up'
          })
        );
      }}
    >
      <ArrowUp />
    </Button>
    <Button
      colorScheme={"blue"}
      size={"xs"}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(
          storyActions.sortItem({
            id: props.id,
            kind: props.kind,
            direction: 'down'
          })
        );
      }}
    >
      <ArrowDown />
    </Button>
    <Button
      colorScheme={"red"}
      size={"xs"}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(
          storyActions.deleteTreeItem({
            id: props.id
          })
        );
      }}
    >
      Delete
    </Button>
    </Flex>
  </Flex>
}