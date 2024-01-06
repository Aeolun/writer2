import {Button, CircularProgress, Flex} from "@chakra-ui/react";
import Link from "next/link";
import axios from "axios";
import {RootState, store} from "../lib/store";
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {storyActions} from "../lib/slices/story";
import {globalActions} from "../lib/slices/global";
import {save} from "../lib/actions/save";

export const HeaderMenu = () => {
  const saving = useSelector((store: RootState) => store.base.saving);
  const dispatch = useDispatch();

  return <Flex bg={"green.300"} justifyContent={'space-between'}>
    <Flex px={2} py={1} gap={1}>
      <Link href={'/'}><Button>Story</Button></Link>
      <Link href={'/characters'}><Button>Characters</Button></Link>
      <Link href={'/locations'}><Button>Locations</Button></Link>
      <Link href={'/plot-points'}><Button>Plot Points</Button></Link>
      <Link href={'/settings'}><Button>Settings</Button></Link>
    </Flex>
    <Flex px={2} py={1} justifyContent={"flex-end"}>
      <Button onClick={() => {
        dispatch(storyActions.unload());
        axios.get('/api/list').then((res) => {
          dispatch(globalActions.setStories(res.data));
        });
      }}>Switch</Button>

      <Button
        rightIcon={saving ? <CircularProgress isIndeterminate color="green.300" /> : undefined}
        onClick={() => {
          save().catch(e => {
            console.error(e);
          });
        }}
      >
        Save
      </Button>

    </Flex>
  </Flex>
}